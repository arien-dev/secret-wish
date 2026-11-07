import { prisma } from "@/lib/db/prisma";
import { generateSecureToken, hashToken, slugify } from "@/lib/crypto";

export interface CreateWishlistInput {
  title: string;
  description?: string | null;
  occasion?: "BIRTHDAY" | "CHRISTMAS" | "BABY" | "WEDDING" | "MOVING" | "OTHER";
  eventDate?: string | Date | null;
  isPublic?: boolean;
  familyId?: string | null;
  childMemberId?: string | null;
}

export interface UpdateWishlistInput {
  title?: string;
  description?: string | null;
  occasion?: "BIRTHDAY" | "CHRISTMAS" | "BABY" | "WEDDING" | "MOVING" | "OTHER";
  eventDate?: string | Date | null;
  isPublic?: boolean;
  isArchived?: boolean;
}

export class WishlistService {
  /**
   * Retrieves all active wishlists for a user (own lists and lists in shared families).
   */
  static async getWishlistsForUser(userId: string) {
    // Find user's families
    const userFamilies = await prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const wishlists = await prisma.wishlist.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { familyId: { in: familyIds } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
        family: {
          select: { id: true, name: true },
        },
        childMember: {
          select: { id: true, childName: true },
        },
        items: {
          where: { deletedAt: null },
          select: {
            id: true,
            isReceived: true,
            isGroupGift: true,
            targetAmount: true,
            quantity: true,
            reservations: {
              where: { status: { not: "CANCELLED" } },
              select: {
                id: true,
                quantity: true,
                amount: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Anonymize & aggregate item data
    return wishlists.map((list) => {
      const totalItems = list.items.length;
      let reservedItems = 0;
      let receivedItems = 0;

      for (const item of list.items) {
        if (item.isReceived) {
          receivedItems++;
        }
        const totalReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
        if (totalReservedQty >= item.quantity) {
          reservedItems++;
        }
      }

      // Remove raw reservations array to avoid leaking anything
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { items, ...rest } = list;
      return {
        ...rest,
        stats: {
          totalItems,
          reservedItems,
          receivedItems,
        },
      };
    });
  }

  /**
   * Retrieves a single wishlist with items for the owner/family member.
   * Strips all guest identity information.
   */
  static async getWishlistById(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        deletedAt: null,
      },
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
        family: {
          select: { id: true, name: true },
        },
        childMember: {
          select: { id: true, childName: true },
        },
        items: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          include: {
            reservations: {
              where: { status: { not: "CANCELLED" } },
              select: {
                id: true,
                quantity: true,
                amount: true,
                status: true,
                createdAt: true,
                // NEVER select guestTokenHash or guest info here!
              },
            },
          },
        },
      },
    });

    if (!wishlist) return null;

    // Check permission: owner or member of family
    const isOwner = wishlist.ownerId === userId;
    let isFamilyMember = false;

    if (wishlist.familyId) {
      const membership = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId: wishlist.familyId,
            userId,
          },
        },
      });
      if (membership) isFamilyMember = true;
    }

    if (!isOwner && !isFamilyMember) {
      return null;
    }

    // Sanitize item details for the owner:
    // The owner sees reservation progress / status, but NEVER who reserved it!
    const sanitizedItems = wishlist.items.map((item) => {
      const totalReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const totalContributedAmount = item.reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
      const isReserved = totalReservedQty >= item.quantity;
      const isPurchased = item.reservations.some((r) => r.status === "PURCHASED" || r.status === "DELIVERED");

      return {
        id: item.id,
        wishlistId: item.wishlistId,
        title: item.title,
        description: item.description,
        url: item.url,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        priority: item.priority,
        quantity: item.quantity,
        variant: item.variant,
        note: item.note,
        tags: item.tags,
        sortOrder: item.sortOrder,
        isGroupGift: item.isGroupGift,
        targetAmount: item.targetAmount,
        isReceived: item.isReceived,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // Aggregated reservation status:
        reservationStatus: {
          isReserved,
          reservedQuantity: totalReservedQty,
          isPurchased,
          contributedAmount: totalContributedAmount,
          isFullyFunded: item.isGroupGift && item.targetAmount ? totalContributedAmount >= item.targetAmount : isReserved,
        },
      };
    });

    return {
      ...wishlist,
      items: sanitizedItems,
      isOwner,
    };
  }

  /**
   * Creates a new wishlist and generates an unguessable share token.
   */
  static async createWishlist(userId: string, data: CreateWishlistInput) {
    const rawShareToken = generateSecureToken(24);
    const shareTokenHash = hashToken(rawShareToken);
    const slug = slugify(data.title) || "liste";

    const wishlist = await prisma.wishlist.create({
      data: {
        ownerId: userId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        occasion: data.occasion || "OTHER",
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        slug,
        shareTokenHash,
        isPublic: data.isPublic ?? false,
        familyId: data.familyId || null,
        childMemberId: data.childMemberId || null,
      },
    });

    return {
      ...wishlist,
      shareToken: rawShareToken, // Plaintext token returned only upon creation or token regeneration
    };
  }

  static async updateWishlist(wishlistId: string, userId: string, data: UpdateWishlistInput) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, ownerId: userId, deletedAt: null },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden oder keine Berechtigung.");
    }

    return await prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        title: data.title ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description : undefined,
        occasion: data.occasion || undefined,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        isPublic: data.isPublic !== undefined ? data.isPublic : undefined,
        isArchived: data.isArchived !== undefined ? data.isArchived : undefined,
      },
    });
  }

  static async softDeleteWishlist(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, ownerId: userId },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden oder keine Berechtigung.");
    }

    return await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { deletedAt: new Date() },
    });
  }

  static async restoreWishlist(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, ownerId: userId },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden.");
    }

    return await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { deletedAt: null },
    });
  }

  static async permanentlyDeleteWishlist(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, ownerId: userId },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden.");
    }

    return await prisma.wishlist.delete({
      where: { id: wishlistId },
    });
  }

  static async regenerateShareToken(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: { id: wishlistId, ownerId: userId },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden.");
    }

    const newRawToken = generateSecureToken(24);
    const newShareTokenHash = hashToken(newRawToken);

    await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { shareTokenHash: newShareTokenHash },
    });

    return { shareToken: newRawToken };
  }
}
