import * as argon2 from "@node-rs/argon2";

/**
 * Hashes a plaintext password using Argon2id.
 * Settings align with OWASP recommendations:
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3 iterations
 * - parallelism: 1
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
