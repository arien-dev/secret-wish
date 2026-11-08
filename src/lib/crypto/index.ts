import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (hex encoded, 64 characters by default).
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generates a short, user-friendly alphanumeric invite code (e.g. for families).
 */
export function generateInviteCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like 0, O, 1, I
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Computes the SHA-256 hash of a token.
 * We store only hashes in the database so that compromised DBs do not leak active guest tokens or session tokens.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a short, URL-safe, random share slug (lowercase alphanumeric).
 * Default length 10 => ~36^10 combinations, unguessable and stable.
 */
export function generateSecureSlug(length: number = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomBytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Converts a title into a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
