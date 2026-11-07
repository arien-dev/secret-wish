import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { WishlistService } from "@/server/services/wishlist.service";
import { ItemService } from "@/server/services/item.service";
import { ReservationService } from "@/server/services/reservation.service";
import { generateSecureToken } from "@/lib/crypto";

describe("Concurrency & Race Condition Defenses", () => {
  let userId: string;
  let rawShareToken: string;
  let singleItemId: string;
  let groupGiftItemId: string;

  const email = "concurrency-test@secretwish.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });

    const user = await AuthService.register({
      name: "Concurrency Tester",
      email,
      password: "TestPassword123!",
    });
    userId = user.id;

    const list = await WishlistService.createWishlist(userId, {
      title: "Race Condition Test List",
      occasion: "OTHER",
    });
    rawShareToken = list.shareToken;

    // Create item with quantity 1 (only ONE guest can get it)
    const singleItem = await ItemService.addItem(list.id, userId, {
      title: "Einzigartiges Unikat",
      price: 150.0,
      quantity: 1,
    });
    singleItemId = singleItem.id;

    // Create group gift item with targetAmount 100 EUR
    const groupItem = await ItemService.addItem(list.id, userId, {
      title: "Gemeinsames Geschenk",
      price: 100.0,
      isGroupGift: true,
      targetAmount: 100.0,
    });
    groupGiftItemId = groupItem.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("should prevent duplicate reservation when multiple guests reserve simultaneously (Race Condition)", async () => {
    // 5 guests try to reserve the same single item (quantity: 1) in parallel
    const guestTokens = Array.from({ length: 5 }, () => generateSecureToken(32));

    const results = await Promise.allSettled(
      guestTokens.map((token) =>
        ReservationService.reserveItem(rawShareToken, singleItemId, token, 1)
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    // Exactly 1 must succeed
    expect(successful.length).toBe(1);

    // The other 4 must be rejected with conflict
    expect(failed.length).toBe(4);
    for (const fail of failed) {
      if (fail.status === "rejected") {
        expect(fail.reason.message).toContain("nicht mehr in der gewünschten Anzahl verfügbar");
      }
    }

    // Verify DB state: exactly 1 active reservation exists
    const activeReservations = await prisma.reservation.findMany({
      where: { itemId: singleItemId, status: { not: "CANCELLED" } },
    });
    expect(activeReservations.length).toBe(1);
  });

  it("should enforce group gift target amount and prevent overbooking", async () => {
    const guestA = generateSecureToken(32);
    const guestB = generateSecureToken(32);
    const guestC = generateSecureToken(32);

    // Guest A contributes 60 EUR (Remaining: 40 EUR)
    await ReservationService.contributeGroupGift(rawShareToken, groupGiftItemId, guestA, 60);

    // Guest B contributes 40 EUR (Target of 100 EUR is reached)
    await ReservationService.contributeGroupGift(rawShareToken, groupGiftItemId, guestB, 40);

    // Guest C attempts to contribute 10 EUR after target is reached -> MUST FAIL
    await expect(
      ReservationService.contributeGroupGift(rawShareToken, groupGiftItemId, guestC, 10)
    ).rejects.toThrow("vollständig finanziert");

    // Verify DB total sum is exactly 100 EUR
    const reservations = await prisma.reservation.findMany({
      where: { itemId: groupGiftItemId, status: { not: "CANCELLED" } },
    });
    const totalAmount = reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
    expect(totalAmount).toBe(100.0);
  });
});
