import { describe, it, expect } from "vitest";
import {
  RegisterSchema,
  LoginSchema,
  CreateWishlistSchema,
  CreateItemSchema,
  ReserveItemSchema,
  ContributeGroupGiftSchema,
} from "@/lib/validation/schemas";

describe("Input Validation (Zod Schemas)", () => {
  describe("RegisterSchema", () => {
    it("should accept valid registration data", () => {
      const valid = {
        name: "Max Mustermann",
        email: "max@example.com",
        password: "securePassword123!",
      };
      expect(RegisterSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalid = {
        name: "Max",
        email: "invalid-email-address",
        password: "securePassword123!",
      };
      expect(RegisterSchema.safeParse(invalid).success).toBe(false);
    });

    it("should reject short password (< 8 chars)", () => {
      const invalid = {
        name: "Max",
        email: "max@example.com",
        password: "short",
      };
      expect(RegisterSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("CreateWishlistSchema", () => {
    it("should accept valid wishlist with occasion", () => {
      const valid = {
        title: "Geburtstag 2026",
        occasion: "BIRTHDAY",
        isPublic: false,
      };
      expect(CreateWishlistSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject empty title", () => {
      const invalid = {
        title: " ",
        occasion: "BIRTHDAY",
      };
      expect(CreateWishlistSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("CreateItemSchema", () => {
    it("should accept valid item with price, currency and priority", () => {
      const valid = {
        title: "Kopfhörer mit Noise Cancelling",
        price: 199.99,
        currency: "EUR",
        priority: "MUST_HAVE",
        quantity: 1,
      };
      expect(CreateItemSchema.safeParse(valid).success).toBe(true);
    });

    it("should accept group gift with target amount", () => {
      const valid = {
        title: "Fahrrad",
        price: 500,
        currency: "EUR",
        isGroupGift: true,
        targetAmount: 500,
      };
      expect(CreateItemSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject negative prices", () => {
      const invalid = {
        title: "Buch",
        price: -10,
      };
      expect(CreateItemSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("ContributeGroupGiftSchema", () => {
    it("should accept positive contribution amounts", () => {
      expect(ContributeGroupGiftSchema.safeParse({ amount: 25 }).success).toBe(true);
      expect(ContributeGroupGiftSchema.safeParse({ amount: 100.5 }).success).toBe(true);
    });

    it("should reject zero or negative contribution amounts", () => {
      expect(ContributeGroupGiftSchema.safeParse({ amount: 0 }).success).toBe(false);
      expect(ContributeGroupGiftSchema.safeParse({ amount: -15 }).success).toBe(false);
    });
  });
});
