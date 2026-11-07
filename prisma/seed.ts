import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function main() {
  console.log("Seeding SecretWish database...");

  // Clean existing demo data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.family.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo User
  const passwordHash = await hashPassword("SecretWish123!");

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@secretwish.local",
      name: "Anna Mustermann",
      passwordHash,
    },
  });

  console.log(`Created demo user: ${demoUser.email} (Password: SecretWish123!)`);

  // 2. Create Family Room
  const family = await prisma.family.create({
    data: {
      name: "Familie Mustermann",
      ownerId: demoUser.id,
      inviteCode: "FAMILIE1",
    },
  });

  await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: demoUser.id,
      role: "OWNER",
    },
  });

  // 3. Create Child Profile without Account
  const child = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      childName: "Felix (6 Jahre)",
      role: "CHILD",
    },
  });

  // 4. Create Wishlists
  // Adult Wishlist
  const rawShareToken1 = "demo-geburtstag-2026-secret-token";
  const wishlist1 = await prisma.wishlist.create({
    data: {
      ownerId: demoUser.id,
      title: "Annas 30. Geburtstag 🎉",
      description: "Ich freue mich riesig auf unser Fest! Hier sind ein paar Dinge, die mir eine Freude machen würden.",
      occasion: "BIRTHDAY",
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      slug: "annas-30-geburtstag",
      shareTokenHash: hashToken(rawShareToken1),
      isPublic: true,
      familyId: family.id,
    },
  });

  // Child Wishlist
  const rawShareToken2 = "felix-schulstart-2026-secret-token";
  const wishlist2 = await prisma.wishlist.create({
    data: {
      ownerId: demoUser.id,
      title: "Felix' Einschulung 🎒",
      description: "Geschenke für Felix' großen ersten Schultag. Bitte vorher kurz absprechen!",
      occasion: "OTHER",
      eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      slug: "felix-einschulung",
      shareTokenHash: hashToken(rawShareToken2),
      isPublic: false,
      familyId: family.id,
      childMemberId: child.id,
    },
  });

  // 5. Create Wishlist Items
  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist1.id,
      title: "Kuscheldecke aus Merinowolle",
      description: "Farbe gerne Creme, Salbeigrün oder Senfgelb.",
      url: "https://example.com/kuscheldecke",
      price: 69.90,
      currency: "EUR",
      priority: "MUST_HAVE",
      quantity: 1,
      variant: "Farbe Salbeigrün",
      sortOrder: 0,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist1.id,
      title: "Espressomaschine für guten Kaffee",
      description: "Ein Gruppengeschenk, damit alle gemütlich Kaffee trinken können.",
      url: "https://example.com/espresso",
      price: 320.00,
      currency: "EUR",
      priority: "HIGH",
      quantity: 1,
      isGroupGift: true,
      targetAmount: 320.00,
      sortOrder: 1,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist2.id,
      title: "Schulranzen-Set mit Sporttasche",
      description: "Motiv Weltall oder Dinos.",
      price: 149.00,
      currency: "EUR",
      priority: "MUST_HAVE",
      quantity: 1,
      sortOrder: 0,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
