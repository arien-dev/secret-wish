import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function main() {
  console.log("Seeding SecretWish database (idempotent)...");

  const demoEmail = "demo@secretwish.local";
  const passwordHash = await hashPassword("SecretWish123!");

  // 1. Demo User (nur anlegen, falls noch nicht vorhanden)
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: { email: demoEmail, name: "Anna Mustermann", passwordHash },
    });
    console.log(`Created demo user: ${demoUser.email} (Password: SecretWish123!)`);
  } else {
    console.log(`Demo user already exists: ${demoUser.email}`);
  }

  // 2. Family Room (idempotent über inviteCode)
  let family = await prisma.family.findUnique({ where: { inviteCode: "FAMILIE1" } });
  if (!family) {
    family = await prisma.family.create({
      data: { name: "Familie Mustermann", ownerId: demoUser.id, inviteCode: "FAMILIE1" },
    });
    await prisma.familyMember.create({
      data: { familyId: family.id, userId: demoUser.id, role: "OWNER" },
    });
    console.log(`Created family: ${family.name}`);
  } else {
    console.log(`Family already exists: ${family.name}`);
    // Mitglied sicherstellen
    const existingMember = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId: family.id, userId: demoUser.id } },
    });
    if (!existingMember) {
      await prisma.familyMember.create({
        data: { familyId: family.id, userId: demoUser.id, role: "OWNER" },
      });
    }
  }

  // 3. Child Profile (idempotent)
  let child = await prisma.familyMember.findFirst({
    where: { familyId: family.id, childName: "Felix (6 Jahre)", role: "CHILD" },
  });
  if (!child) {
    child = await prisma.familyMember.create({
      data: { familyId: family.id, childName: "Felix (6 Jahre)", role: "CHILD" },
    });
    console.log(`Created child profile: ${child.childName}`);
  } else {
    console.log(`Child profile already exists: ${child.childName}`);
  }

  // 4. Wishlists (idempotent über slug)
  const wishlistData = [
    {
      slug: "annas-30-geburtstag",
      title: "Annas 30. Geburtstag 🎉",
      description: "Ich freue mich riesig auf unser Fest! Hier sind ein paar Dinge, die mir eine Freude machen würden.",
      occasion: "BIRTHDAY",
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isPublic: true,
      familyId: family.id,
      childMemberId: null,
      rawToken: "demo-geburtstag-2026-secret-token",
    },
    {
      slug: "felix-einschulung",
      title: "Felix' Einschulung 🎒",
      description: "Geschenke für Felix' großen ersten Schultag. Bitte vorher kurz absprechen!",
      occasion: "OTHER",
      eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isPublic: false,
      familyId: family.id,
      childMemberId: child.id,
      rawToken: "felix-schulstart-2026-secret-token",
    },
  ];

  for (const wl of wishlistData) {
    let wishlist = await prisma.wishlist.findUnique({ where: { slug: wl.slug } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          ownerId: demoUser.id,
          title: wl.title,
          description: wl.description,
          occasion: wl.occasion,
          eventDate: wl.eventDate,
          slug: wl.slug,
          shareTokenHash: hashToken(wl.rawToken),
          isPublic: wl.isPublic,
          familyId: wl.familyId,
          childMemberId: wl.childMemberId,
        },
      });
      console.log(`Created wishlist: ${wl.title} (${wl.slug})`);
    } else {
      console.log(`Wishlist already exists: ${wl.title} (${wl.slug})`);
    }

    // 5. Items (idempotent über Titel innerhalb der Liste)
    if (wl.slug === "annas-30-geburtstag") {
      await ensureItem(wishlist.id, {
        title: "Kuscheldecke aus Merinowolle",
        description: "Farbe gerne Creme, Salbeigrün oder Senfgelb.",
        url: "https://example.com/kuscheldecke",
        price: 69.90,
        currency: "EUR",
        priority: "MUST_HAVE",
        quantity: 1,
        variant: "Farbe Salbeigrün",
        sortOrder: 0,
      });
      await ensureItem(wishlist.id, {
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
      });
    } else if (wl.slug === "felix-einschulung") {
      await ensureItem(wishlist.id, {
        title: "Schulranzen-Set mit Sporttasche",
        description: "Motiv Weltall oder Dinos.",
        price: 149.00,
        currency: "EUR",
        priority: "MUST_HAVE",
        quantity: 1,
        sortOrder: 0,
      });
    }
  }

  console.log("Seeding completed successfully!");
}

async function ensureItem(wishlistId: string, data: any) {
  const existing = await prisma.wishlistItem.findFirst({
    where: { wishlistId, title: data.title },
  });
  if (existing) {
    console.log(`  Item already exists: ${data.title}`);
    return existing;
  }
  const item = await prisma.wishlistItem.create({
    data: {
      wishlistId,
      title: data.title,
      description: data.description || null,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      price: data.price,
      currency: data.currency || "EUR",
      priority: data.priority || "MEDIUM",
      quantity: data.quantity ?? 1,
      variant: data.variant || null,
      isGroupGift: data.isGroupGift || false,
      targetAmount: data.targetAmount || null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  console.log(`  Created item: ${data.title}`);
  return item;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
