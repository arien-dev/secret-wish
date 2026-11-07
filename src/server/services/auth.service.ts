import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, invalidateSession } from "@/lib/auth/session";
import { generateSecureToken, hashToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export class AuthService {
  static async register(data: { email: string; name: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error("Ein Konto mit dieser E-Mail-Adresse existiert bereits.");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(
    data: { email: string; password: string },
    userAgent?: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user || user.deletedAt) {
      throw new Error("Ungültige Anmeldedaten.");
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Ungültige Anmeldedaten.");
    }

    const session = await createSession(user.id, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      sessionToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  static async logout(sessionToken: string) {
    await invalidateSession(sessionToken);
  }

  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // We do not leak whether user exists
    if (!user || user.deletedAt) {
      return { success: true };
    }

    const resetToken = generateSecureToken(32);
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Invalidate old tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return { success: true, resetTokenForDev: process.env.NODE_ENV !== "production" ? resetToken : undefined };
  }

  static async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new Error("Dieser Link zum Zurücksetzen ist ungültig oder abgelaufen.");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate existing sessions for security
      prisma.session.deleteMany({
        where: { userId: record.userId },
      }),
    ]);

    return { success: true };
  }
}
