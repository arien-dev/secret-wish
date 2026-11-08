import { z } from "zod";

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(255),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein.").max(100),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
    .max(128, "Das Passwort darf maximal 128 Zeichen lang sein."),
});

export const LoginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
  password: z.string().min(1, "Passwort erforderlich."),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse."),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset-Token fehlt."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.").max(128),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein.").max(100),
  avatarUrl: z.string().url().nullable().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort erforderlich."),
  newPassword: z.string().min(8, "Neues Passwort muss mindestens 8 Zeichen lang sein.").max(128),
});

// ==========================================
// WISHLIST SCHEMAS
// ==========================================

export const OccasionEnum = z.enum([
  "BIRTHDAY",
  "CHRISTMAS",
  "BABY",
  "WEDDING",
  "MOVING",
  "OTHER",
]);

export const CreateWishlistSchema = z.object({
  title: z.string().min(2, "Titel muss mindestens 2 Zeichen haben.").max(120),
  description: z.string().max(1000).optional().nullable(),
  occasion: OccasionEnum.default("OTHER"),
  eventDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  isPublic: z.boolean().default(false),
  familyId: z.string().optional().nullable(),
  childMemberId: z.string().optional().nullable(),
});

export const UpdateWishlistSchema = CreateWishlistSchema.partial();

// ==========================================
// ITEM SCHEMAS
// ==========================================

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "MUST_HAVE"]);

export const CreateItemSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich.").max(200),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url("Bitte eine gültige URL angeben.").optional().nullable().or(z.literal("")),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  price: z.number().min(0, "Preis darf nicht negativ sein.").optional().nullable(),
  currency: z.string().min(1).max(10).default("EUR"),
  priority: PriorityEnum.default("MEDIUM"),
  quantity: z.number().int().min(1, "Mindestens 1 Stück.").max(99).default(1),
  variant: z.string().max(100).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  tags: z.string().max(200).optional().nullable(),
  isGroupGift: z.boolean().default(false),
  targetAmount: z.number().min(1).optional().nullable(),
});

export const UpdateItemSchema = CreateItemSchema.partial();

export const ReorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

// ==========================================
// PUBLIC & RESERVATION SCHEMAS
// ==========================================

export const GuestSessionSchema = z.object({
  displayName: z.string().max(50).optional().nullable(),
});

export const ReserveItemSchema = z.object({
  quantity: z.number().int().min(1).default(1),
});

export const ContributeGroupGiftSchema = z.object({
  amount: z.number().positive("Beitrag muss größer als 0 sein."),
});

// ==========================================
// FAMILY SCHEMAS
// ==========================================

export const CreateFamilySchema = z.object({
  name: z.string().min(2, "Name des Familienraums muss mindestens 2 Zeichen lang sein.").max(100),
});

export const JoinFamilySchema = z.object({
  inviteCode: z.string().min(4).max(20),
});

export const CreateChildProfileSchema = z.object({
  childName: z.string().min(2, "Name des Kindes ist erforderlich.").max(100),
});

// ==========================================
// SHARE SLUG SCHEMAS
// ==========================================

const RESERVED_SLUGS = new Set([
  "admin","api","login","register","logout","share","dashboard","wishlists","wishlist",
  "items","item","families","family","public","me","session","sessions","upload","uploads",
  "notification","notifications","_next","static","favicon.ico","sitemap.xml","robots.txt",
  "settings","profile","reset-password","forgot-password","auth","health","manifest",
  "sw.js","service-worker","create","new","edit","delete",
]);

const OFFENSIVE_SLUGS = new Set([
  "nigga","nigger","nazi","hitler","fuck","shit","cunt","twat","bitch","bastard",
  "faggot","fag","dyke","tranny","retard","kike","spic","chink","gook","gypo",
  "wog","coon","wetback","honkey","cracker","redneck","hillbilly","degenerate",
]);

export const CustomSlugSchema = z
  .string()
  .min(3, "Der Link muss mindestens 3 Zeichen lang sein.")
  .max(40, "Der Link darf maximal 40 Zeichen lang sein.")
  .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche sind erlaubt.")
  .refine((v) => !v.startsWith("-") && !v.endsWith("-") && !v.includes("--"), {
    message: "Bindestriche dürfen nicht am Anfang/Ende stehen und nicht doppelt vorkommen.",
  })
  .refine((v) => !RESERVED_SLUGS.has(v), {
    message: "Dieser Link-Name ist reserviert und darf nicht verwendet werden.",
  })
  .refine((v) => !OFFENSIVE_SLUGS.has(v.toLowerCase()), {
    message: "Dieser Link-Name ist nicht zulässig.",
  });

// ==========================================
// PUBLIC & RESERVATION SCHEMAS
// ==========================================
