import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Password Hashing & Verification (Argon2id)", () => {
  it("should generate a valid Argon2id hash", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("should successfully verify a correct password", async () => {
    const password = "CorrectPassword123#";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "CorrectPassword123#";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword("WrongPassword!", hash);
    expect(isValid).toBe(false);
  });

  it("should produce different hashes for the same password due to random salting", async () => {
    const password = "SamePassword123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });
});
