import { describe, it, expect } from "vitest";
import { generateSecureToken, generateInviteCode, hashToken, slugify } from "@/lib/crypto";

describe("Crypto & Token Utilities", () => {
  it("should generate random tokens of expected length", () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).toHaveLength(64); // 32 bytes hex encoded = 64 chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("should generate user-friendly invite codes without ambiguous characters", () => {
    const code = generateInviteCode(8);
    expect(code).toHaveLength(8);
    // Should not contain 0, O, 1, I
    expect(code).not.toMatch(/[01OI]/);
  });

  it("should deterministically hash tokens with SHA-256", () => {
    const token = "fixed-token-for-test-12345";
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(token);
  });

  it("should generate clean URL slugs from arbitrary strings", () => {
    expect(slugify("Mein 30. Geburtstag!")).toBe("mein-30-geburtstag");
    expect(slugify("  Weihnachten & Geschenke 2026   ")).toBe("weihnachten-geschenke-2026");
    expect(slugify("BABY-PARTY")).toBe("baby-party");
  });
});
