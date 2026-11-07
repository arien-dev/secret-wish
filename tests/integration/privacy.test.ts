import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { WishlistService } from "@/server/services/wishlist.service";
import { ItemService } from "@/server/services/item.service";
import { ReservationService } from "@/server/services/reservation.service";
import { generateSecureToken } from "@/lib/crypto";

describe("Strict Zero-Knowledge Privacy Isolation", () => {
  let ownerId: string;
  let wishlistId: string;
  let rawShareToken: string;
  let itemId: string;

  const ownerEmail = "owner-privacy@secretwish.local";
  const guest1Token = generateSecureToken(32);
  const guest2Token = generateSecureToken(32);

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: ownerEmail } });

    const owner = await AuthService.register({
      name: "Owner With Secrets",
      email: ownerEmail,
      password: "OwnerPassword123!",
    });
    ownerId = owner.id;

    const list = await WishlistService.createWishlist(ownerId, {
      title: "Geheime Wunschliste",
      occasion: "BIRTHDAY",
    });
    wishlistId = list.id;
    rawShareToken = list.shareToken;

    const item = await ItemService.addItem(wishlistId, ownerId, {
      title: "Geheimes Wunsch-Objekt",
      price: 80.0,
      quantity: 1,
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: ownerEmail } });
    await prisma.$disconnect();
  });

  it("should allow Guest 1 to reserve with optional display name", async () => {
    await ReservationService.registerGuest(rawShareToken, guest1Token, "Geheimer Spender Max");

    const reservation = await ReservationService.reserveItem(
      rawShareToken,
      itemId,
      guest1Token,
      1
    );

    expect(reservation).toBeDefined();
    expect(reservation.status).toBe("RESERVED");
  });

  it("STRICT PRIVACY: List owner must NEVER see guest name, token, or individual reservation", async () => {
    const ownerView = await WishlistService.getWishlistById(wishlistId, ownerId);
    expect(ownerView).not.toBeNull();

    const item = ownerView?.items.find((i: any) => i.id === itemId);
    expect(item).toBeDefined();

    // The owner sees only aggregated anonymous status
    expect(item?.reservationStatus?.isReserved).toBe(true);
    expect(item?.reservationStatus?.reservedQuantity).toBe(1);

    // CRITICAL: Verify NO guestTokenHash, NO guest name, NO reservations array exposed to owner
    expect((item as any).reservations).toBeUndefined();
    expect((item as any).guestTokenHash).toBeUndefined();
    expect((item as any).guestName).toBeUndefined();

    // Verify stringified representation doesn't contain the guest's name or token
    const serialized = JSON.stringify(ownerView);
    expect(serialized).not.toContain("Geheimer Spender Max");
    expect(serialized).not.toContain(guest1Token);
  });

  it("STRICT PRIVACY: Another guest (Guest 2) must NOT see who reserved the item", async () => {
    const guest2View = await ReservationService.getPublicWishlist(rawShareToken, guest2Token);
    expect(guest2View).not.toBeNull();

    const item = guest2View?.items.find((i) => i.id === itemId);
    expect(item?.status.isReserved).toBe(true);
    expect(item?.myReservation).toBeNull(); // Guest 2 did not reserve it

    const serialized = JSON.stringify(guest2View);
    expect(serialized).not.toContain("Geheimer Spender Max");
    expect(serialized).not.toContain(guest1Token);
  });

  it("Only the reserving guest (Guest 1) sees isMine: true and can manage their claim", async () => {
    const guest1View = await ReservationService.getPublicWishlist(rawShareToken, guest1Token);
    const item = guest1View?.items.find((i) => i.id === itemId);

    expect(item?.myReservation).not.toBeNull();
    expect(item?.myReservation?.isMine).toBe(true);
    expect(item?.myReservation?.quantity).toBe(1);

    // Guest 1 releases claim
    await ReservationService.cancelReservation(rawShareToken, itemId, guest1Token);

    // Item should now be free again
    const updatedView = await ReservationService.getPublicWishlist(rawShareToken, guest1Token);
    const updatedItem = updatedView?.items.find((i) => i.id === itemId);
    expect(updatedItem?.status.isReserved).toBe(false);
  });
});
