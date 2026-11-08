import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { WishlistService } from "@/server/services/wishlist.service";
import { ItemService } from "@/server/services/item.service";

describe("Wishlist & Items Integration Flow", () => {
  let userId: string;
  let wishlistId: string;
  let rawShareToken: string;
  const testEmail = "wishlist-test@secretwish.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    const user = await AuthService.register({
      name: "Wishlist Tester",
      email: testEmail,
      password: "TestPassword123!",
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it("should create a new wishlist with unguessable share token", async () => {
    const list = await WishlistService.createWishlist(userId, {
      title: "Mein Sommerfest 2026",
      occasion: "OTHER",
      description: "Eine tolle Feier",
    });

    expect(list.id).toBeDefined();
    expect(list.title).toBe("Mein Sommerfest 2026");
    expect(list.shareToken).toBeDefined();
    // Share-Slug muss URL-sicher sein: 3-40 Zeichen, nur a-z, 0-9 und Bindestriche
    expect(list.shareToken.length).toBeGreaterThanOrEqual(3);
    expect(list.shareToken.length).toBeLessThanOrEqual(40);
    expect(list.shareToken).toMatch(/^[a-z0-9-]+$/);

    wishlistId = list.id;
    rawShareToken = list.shareToken;
  });

  it("should add items to the wishlist", async () => {
    const item1 = await ItemService.addItem(wishlistId, userId, {
      title: "Hängematte für den Garten",
      price: 49.99,
      priority: "HIGH",
      quantity: 1,
    });

    const item2 = await ItemService.addItem(wishlistId, userId, {
      title: "Gartenpavillon",
      price: 200.0,
      isGroupGift: true,
      targetAmount: 200.0,
      priority: "MUST_HAVE",
    });

    expect(item1.id).toBeDefined();
    expect(item1.sortOrder).toBe(0);
    expect(item2.id).toBeDefined();
    expect(item2.sortOrder).toBe(1);
    expect(item2.isGroupGift).toBe(true);
  });

  it("should duplicate an item", async () => {
    const items = await prisma.wishlistItem.findMany({ where: { wishlistId } });
    const firstItem = items[0];

    const duplicate = await ItemService.duplicateItem(firstItem.id, userId);
    expect(duplicate.title).toBe(`${firstItem.title} (Kopie)`);
    expect(duplicate.price).toBe(firstItem.price);
  });

  it("should soft delete wishlist into trash and restore it", async () => {
    await WishlistService.softDeleteWishlist(wishlistId, userId);

    const deletedList = await prisma.wishlist.findUnique({ where: { id: wishlistId } });
    expect(deletedList?.deletedAt).not.toBeNull();

    await WishlistService.restoreWishlist(wishlistId, userId);
    const restoredList = await prisma.wishlist.findUnique({ where: { id: wishlistId } });
    expect(restoredList?.deletedAt).toBeNull();
  });

  it("should set a custom slug and reject a duplicate slug", async () => {
    // Erstelle eine zweite Liste für den Kollisionstest
    const user2 = await AuthService.register({
      name: "Collision Tester 2",
      email: "collision-test-2@secretwish.local",
      password: "TestPassword123!",
    });

    const listA = await WishlistService.createWishlist(userId, {
      title: "Liste A",
      occasion: "OTHER",
    });
    await WishlistService.setCustomSlug(listA.id, userId, "mein-slug-test");

    const listB = await WishlistService.createWishlist(user2.id, {
      title: "Liste B",
      occasion: "OTHER",
    });

    // Eigener Slug auf Liste A funktioniert
    const updatedA = await WishlistService.setCustomSlug(listA.id, userId, "mein-neuer-slug");
    expect(updatedA.slug).toBe("mein-neuer-slug");

    // Doppelter Slug von Liste B auf Liste A setzen -> Konflikt
    await expect(
      WishlistService.setCustomSlug(listB.id, user2.id, "mein-neuer-slug"),
    ).rejects.toThrow(/bereits vergeben/);

    // Aufräumen
    await prisma.user.deleteMany({ where: { email: "collision-test-2@secretwish.local" } });
  });
});
