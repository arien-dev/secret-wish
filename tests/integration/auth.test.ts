import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { validateSessionToken } from "@/lib/auth/session";

describe("Auth Integration Flow", () => {
  const testEmail = "testuser@secretwish.local";
  const testPassword = "ValidPassword123!";

  beforeAll(async () => {
    // Cleanup any existing test user
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it("should successfully register a new user with Argon2id hash", async () => {
    const user = await AuthService.register({
      name: "Test User",
      email: testEmail,
      password: testPassword,
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.name).toBe("Test User");

    // Verify password in DB is an Argon2id hash, not plaintext
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser?.passwordHash.startsWith("$argon2id$")).toBe(true);
    expect(dbUser?.passwordHash).not.toContain(testPassword);
  });

  it("should reject registering duplicate emails", async () => {
    await expect(
      AuthService.register({
        name: "Test Duplicate",
        email: testEmail,
        password: "AnotherPassword123!",
      })
    ).rejects.toThrow("existiert bereits");
  });

  it("should successfully login and create an authenticated session", async () => {
    const loginResult = await AuthService.login(
      { email: testEmail, password: testPassword },
      "Vitest Runner",
      "127.0.0.1"
    );

    expect(loginResult.user.email).toBe(testEmail);
    expect(loginResult.sessionToken).toBeDefined();
    expect(loginResult.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // Validate session token
    const sessionValidation = await validateSessionToken(loginResult.sessionToken);
    expect(sessionValidation).not.toBeNull();
    expect(sessionValidation?.user.email).toBe(testEmail);
  });

  it("should reject login with wrong password", async () => {
    await expect(
      AuthService.login({ email: testEmail, password: "IncorrectPassword!" })
    ).rejects.toThrow("Ungültige Anmeldedaten");
  });

  it("should invalidate session on logout", async () => {
    const loginResult = await AuthService.login({
      email: testEmail,
      password: testPassword,
    });

    await AuthService.logout(loginResult.sessionToken);

    // After logout, token must be invalid
    const sessionValidation = await validateSessionToken(loginResult.sessionToken);
    expect(sessionValidation).toBeNull();
  });
});
