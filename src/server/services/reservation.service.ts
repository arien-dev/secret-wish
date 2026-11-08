import { prisma } from "@/lib/db/prisma";
import { hashToken } from "@/lib/crypto";

export class ReservationService {
  /**
   * Helper to look up a wishlist by its public share slug.
   * Slugs are stable and unique: /share/<slug>
   */
  private static async getWishlistByToken(rawShareSlug: string) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { slug: rawShareSlug },
      include: {
        owner: {
          select: { name: true, avatarUrl: true },
        },
        childMember: {
          select: { childName: true },
        },
      },
    });

    if (!wishlist || wishlist.deletedAt) {
      return null;
    }

    return wishlist;
  }

  /**
   * Public view of a wishlist for guests.
   * Strips all other guests' private details.
   */
  static async getPublicWishlist(rawShareToken: string, rawGuestToken?: string | null) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) return null;

    const guestTokenHash = rawGuestToken ? hashToken(rawGuestToken) : null;

    const items = await prisma.wishlistItem.findMany({
      where: {
        wishlistId: wishlist.id,
        deletedAt: null,
      },
      orderBy: { sortOrder: "asc" },
      include: {
        reservations: {
          where: { status: { not: "CANCELLED" } },
          select: {
            id: true,
            guestTokenHash: true,
            amount: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    const sanitizedItems = items.map((item) => {
      const totalReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const totalContributedAmount = item.reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
      const isFullyReserved = totalReservedQty >= item.quantity;
      const isFullyFunded = item.isGroupGift && item.targetAmount
        ? totalContributedAmount >= item.targetAmount
        : isFullyReserved;

      // Check if current guest has an active reservation
      const myReservations = guestTokenHash
        ? item.reservations.filter((r) => r.guestTokenHash === guestTokenHash)
        : [];
      const hasMyReservation = myReservations.length > 0;
      const myContributedAmount = myReservations.reduce((sum, r) => sum + (r.amount || 0), 0);
      const myReservedQuantity = myReservations.reduce((sum, r) => sum + r.quantity, 0);
      const myStatus = myReservations[0]?.status ?? null;

      return {
        id: item.id,
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
        isGroupGift: item.isGroupGift,
        targetAmount: item.targetAmount,
        isReceived: item.isReceived,
        // Publicly visible claim status
        status: {
          isReserved: isFullyReserved,
          reservedQuantity: totalReservedQty,
          remainingQuantity: Math.max(0, item.quantity - totalReservedQty),
          isFullyFunded,
          contributedAmount: totalContributedAmount,
          remainingAmount: item.targetAmount ? Math.max(0, item.targetAmount - totalContributedAmount) : 0,
        },
        // Personal status for this guest only
        myReservation: hasMyReservation
          ? {
              isMine: true,
              quantity: myReservedQuantity,
              amount: myContributedAmount,
              status: myStatus,
            }
          : null,
      };
    });

    return {
      id: wishlist.id,
      title: wishlist.title,
      description: wishlist.description,
      occasion: wishlist.occasion,
      eventDate: wishlist.eventDate,
      ownerName: wishlist.childMember?.childName || wishlist.owner.name,
      items: sanitizedItems,
    };
  }

  /**
   * Initializes or updates a guest profile for a wishlist.
   */
  static async registerGuest(rawShareToken: string, rawGuestToken: string, displayName?: string | null) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    return await prisma.guest.upsert({
      where: { guestTokenHash },
      update: {
        displayName: displayName?.trim() || undefined,
        lastSeenAt: new Date(),
      },
      create: {
        wishlistId: wishlist.id,
        guestTokenHash,
        displayName: displayName?.trim() || null,
      },
    });
  }

  /**
   * Atomically reserves an item under concurrency protection.
   */
  static async reserveItem(
    rawShareToken: string,
    itemId: string,
    rawGuestToken: string,
    quantity: number = 1
  ) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    return await prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.findFirst({
        where: {
          id: itemId,
          wishlistId: wishlist.id,
          deletedAt: null,
        },
        include: {
          reservations: {
            where: { status: { not: "CANCELLED" } },
          },
        },
      });

      if (!item) {
        throw new Error("Wunsch nicht gefunden.");
      }

      const currentReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const availableQty = item.quantity - currentReservedQty;

      if (availableQty < quantity) {
        throw new Error("Dieser Wunsch ist leider nicht mehr in der gewünschten Anzahl verfügbar.");
      }

      // Check if this guest already has a reservation
      const existing = item.reservations.find((r) => r.guestTokenHash === guestTokenHash);

      let reservation;
      if (existing) {
        reservation = await tx.reservation.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
            status: "RESERVED",
          },
        });
      } else {
        reservation = await tx.reservation.create({
          data: {
            itemId: item.id,
            guestTokenHash,
            quantity,
            status: "RESERVED",
          },
        });
      }

      // Create neutral in-app notification for owner (NO guest identifying details)
      await tx.notification.create({
        data: {
          userId: wishlist.ownerId,
          type: "ITEM_RESERVED",
          title: "Ein Wunsch wurde reserviert! 🎁",
          body: `Auf deiner Wunschliste "${wishlist.title}" wurde ein Geschenk reserviert.`,
        },
      });

      return reservation;
    });
  }

  /**
   * Cancels/releases a guest's reservation.
   */
  static async cancelReservation(rawShareToken: string, itemId: string, rawGuestToken: string) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    const reservation = await prisma.reservation.findFirst({
      where: {
        itemId,
        guestTokenHash,
        status: { not: "CANCELLED" },
        item: { wishlistId: wishlist.id },
      },
    });

    if (!reservation) {
      throw new Error("Keine aktive Reservierung für diesen Wunsch gefunden.");
    }

    return await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
    });
  }

  /**
   * Marks a guest's reservation as purchased.
   */
  static async markPurchased(rawShareToken: string, itemId: string, rawGuestToken: string) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    const reservation = await prisma.reservation.findFirst({
      where: {
        itemId,
        guestTokenHash,
        status: { not: "CANCELLED" },
        item: { wishlistId: wishlist.id },
      },
    });

    if (!reservation) {
      throw new Error("Keine aktive Reservierung für diesen Wunsch gefunden.");
    }

    return await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "PURCHASED" },
    });
  }

  /**
   * Contributes a monetary amount towards a group gift under concurrency protection.
   */
  static async contributeGroupGift(
    rawShareToken: string,
    itemId: string,
    rawGuestToken: string,
    amount: number
  ) {
    if (amount <= 0) {
      throw new Error("Der Betrag muss positiv sein.");
    }

    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    return await prisma.$transaction(async (tx) => {
      const item = await tx.wishlistItem.findFirst({
        where: {
          id: itemId,
          wishlistId: wishlist.id,
          deletedAt: null,
          isGroupGift: true,
        },
        include: {
          reservations: {
            where: { status: { not: "CANCELLED" } },
          },
        },
      });

      if (!item || !item.targetAmount) {
        throw new Error("Wunsch nicht als Gruppen-Geschenk gefunden.");
      }

      const currentTotal = item.reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
      const remainingNeeded = item.targetAmount - currentTotal;

      if (remainingNeeded <= 0) {
        throw new Error("Dieses Gruppen-Geschenk ist bereits vollständig finanziert!");
      }

      if (amount > remainingNeeded) {
        throw new Error(
          `Der Betrag überschreitet das Ziel. Es fehlen nur noch ${remainingNeeded.toFixed(2)} ${item.currency}.`
        );
      }

      const reservation = await tx.reservation.create({
        data: {
          itemId: item.id,
          guestTokenHash,
          amount,
          quantity: 1,
          status: "RESERVED",
        },
      });

      const newTotal = currentTotal + amount;
      if (newTotal >= item.targetAmount) {
        // Notify owner that group gift is complete (neutral notification)
        await tx.notification.create({
          data: {
            userId: wishlist.ownerId,
            type: "GROUP_GIFT_COMPLETE",
            title: "Gruppengeschenk finanziert! 🎉",
            body: `Ein Gruppen-Geschenk auf deiner Wunschliste "${wishlist.title}" hat das Ziel erreicht.`,
          },
        });
      }

      return reservation;
    });
  }

  /**
   * Returns all items reserved by the current guest for a wishlist.
   */
  static async getGuestReservations(rawShareToken: string, rawGuestToken: string) {
    const wishlist = await this.getWishlistByToken(rawShareToken);
    if (!wishlist) throw new Error("Wunschliste nicht gefunden.");

    const guestTokenHash = hashToken(rawGuestToken);

    const reservations = await prisma.reservation.findMany({
      where: {
        guestTokenHash,
        status: { not: "CANCELLED" },
        item: {
          wishlistId: wishlist.id,
          deletedAt: null,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            imageUrl: true,
            isGroupGift: true,
            targetAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reservations.map((r) => ({
      reservationId: r.id,
      itemId: r.itemId,
      title: r.item.title,
      imageUrl: r.item.imageUrl,
      price: r.item.price,
      currency: r.item.currency,
      quantity: r.quantity,
      amount: r.amount,
      status: r.status,
      isGroupGift: r.item.isGroupGift,
      createdAt: r.createdAt,
    }));
  }
}
