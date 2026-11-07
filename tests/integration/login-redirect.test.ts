import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { AuthService } from "@/server/services/auth.service";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

describe("Login Cookie & Session Persistence Flow", () => {
  const email = "login-check@secretwish.local";
  const password = "ValidPassword123!";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await AuthService.register({
      name: "Login Check User",
      email,
      password,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("should set a non-empty session cookie on login", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const response = await loginHandler(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe(email);

    // Verify Set-Cookie header contains non-empty session token
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);

    // Ensure cookie is NOT empty (i.e. not "secretwish_session=;")
    const match = setCookie?.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    expect(match).not.toBeNull();
    const token = match?.[1];
    expect(token).toBeDefined();
    expect(token?.length).toBeGreaterThan(20);
  });
});
