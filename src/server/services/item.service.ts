import { prisma } from "@/lib/db/prisma";

export interface CreateItemInput {
  title: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "MUST_HAVE";
  quantity?: number;
  variant?: string | null;
  note?: string | null;
  tags?: string | null;
  isGroupGift?: boolean;
  targetAmount?: number | null;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  sortOrder?: number;
}

export class ItemService {
  private static async verifyListOwnership(wishlistId: string, userId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        deletedAt: null,
      },
    });

    if (!wishlist) {
      throw new Error("Wunschliste nicht gefunden.");
    }

    if (wishlist.ownerId === userId) return wishlist;

    // Check if user is an ADMIN or OWNER in the associated family
    if (wishlist.familyId) {
      const membership = await prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId: wishlist.familyId,
            userId,
          },
        },
      });

      if (membership && (membership.role === "OWNER" || membership.role === "ADMIN" || wishlist.childMemberId)) {
        return wishlist;
      }
    }

    throw new Error("Keine Berechtigung zum Bearbeiten dieser Liste.");
  }

  static async addItem(wishlistId: string, userId: string, data: CreateItemInput) {
    await this.verifyListOwnership(wishlistId, userId);

    // Get max sort order
    const lastItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId, deletedAt: null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (lastItem?.sortOrder ?? -1) + 1;

    return await prisma.wishlistItem.create({
      data: {
        wishlistId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        url: data.url?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        price: data.price !== undefined ? data.price : null,
        currency: data.currency || "EUR",
        priority: data.priority || "MEDIUM",
        quantity: data.quantity && data.quantity > 0 ? data.quantity : 1,
        variant: data.variant?.trim() || null,
        note: data.note?.trim() || null,
        tags: data.tags?.trim() || null,
        isGroupGift: data.isGroupGift || false,
        targetAmount: data.isGroupGift ? data.targetAmount || data.price || null : null,
        sortOrder,
      },
    });
  }

  static async updateItem(itemId: string, userId: string, data: UpdateItemInput) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new Error("Wunsch nicht gefunden.");

    await this.verifyListOwnership(item.wishlistId, userId);

    return await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description?.trim() || null : undefined,
        url: data.url !== undefined ? data.url?.trim() || null : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl?.trim() || null : undefined,
        price: data.price !== undefined ? data.price : undefined,
        currency: data.currency || undefined,
        priority: data.priority || undefined,
        quantity: data.quantity !== undefined ? data.quantity : undefined,
        variant: data.variant !== undefined ? data.variant?.trim() || null : undefined,
        note: data.note !== undefined ? data.note?.trim() || null : undefined,
        tags: data.tags !== undefined ? data.tags?.trim() || null : undefined,
        isGroupGift: data.isGroupGift !== undefined ? data.isGroupGift : undefined,
        targetAmount: data.targetAmount !== undefined ? data.targetAmount : undefined,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
      },
    });
  }

  static async deleteItem(itemId: string, userId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new Error("Wunsch nicht gefunden.");

    await this.verifyListOwnership(item.wishlistId, userId);

    return await prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }

  static async duplicateItem(itemId: string, userId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new Error("Wunsch nicht gefunden.");

    await this.verifyListOwnership(item.wishlistId, userId);

    const lastItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: item.wishlistId, deletedAt: null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (lastItem?.sortOrder ?? -1) + 1;

    return await prisma.wishlistItem.create({
      data: {
        wishlistId: item.wishlistId,
        title: `${item.title} (Kopie)`,
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
        isGroupGift: item.isGroupGift,
        targetAmount: item.targetAmount,
        sortOrder,
      },
    });
  }

  static async reorderItems(
    wishlistId: string,
    userId: string,
    itemsOrder: { id: string; sortOrder: number }[]
  ) {
    await this.verifyListOwnership(wishlistId, userId);

    await prisma.$transaction(
      itemsOrder.map((it) =>
        prisma.wishlistItem.update({
          where: { id: it.id },
          data: { sortOrder: it.sortOrder },
        })
      )
    );

    return { success: true };
  }

  static async markReceived(itemId: string, userId: string, isReceived: boolean = true) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new Error("Wunsch nicht gefunden.");

    await this.verifyListOwnership(item.wishlistId, userId);

    return await prisma.wishlistItem.update({
      where: { id: itemId },
      data: { isReceived },
    });
  }
}
