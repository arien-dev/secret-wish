import { cookies } from "next/headers";
import { prisma } from "../db/prisma";
import { generateSecureToken, hashToken } from "../crypto";

export const SESSION_COOKIE_NAME = "secretwish_session";
export const SESSION_DURATION_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

/**
 * Creates a new user session and stores the hashed token in the database.
 * Returns the raw plaintext token to be set in the cookie.
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSecureToken(32);
  const sessionTokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash,
      expiresAt,
      userAgent: userAgent ? userAgent.slice(0, 255) : null,
      ipAddress: ipAddress ? ipAddress.slice(0, 45) : null,
    },
  });

  return { token, expiresAt };
}

/**
 * Validates a plaintext session token from the cookie.
 * Returns the user and session object if valid, otherwise null.
 */
export async function validateSessionToken(
  token: string
): Promise<{ user: SessionUser; sessionId: string } | null> {
  if (!token || typeof token !== "string") return null;

  const sessionTokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Check if user account was deleted
  if (session.user.deletedAt) {
    return null;
  }

  return {
    sessionId: session.id,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      createdAt: session.user.createdAt,
    },
  };
}

/**
 * Invalidates a single session by plaintext token.
 */
export async function invalidateSession(token: string): Promise<void> {
  const sessionTokenHash = hashToken(token);
  await prisma.session.deleteMany({
    where: { sessionTokenHash },
  });
}

/**
 * In Next.js Server Components and Route Handlers:
 * Reads session cookie and returns current authenticated user or null.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const result = await validateSessionToken(token);
    return result ? result.user : null;
  } catch {
    return null;
  }
}

/**
 * Cookie options helper
 */
export function getSessionCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}
