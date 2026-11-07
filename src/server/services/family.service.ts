import { prisma } from "@/lib/db/prisma";
import { generateInviteCode } from "@/lib/crypto";

export class FamilyService {
  static async getFamiliesForUser(userId: string) {
    const memberships = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
            wishlists: {
              where: { deletedAt: null },
              select: {
                id: true,
                title: true,
                occasion: true,
                childMemberId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return memberships.map((m) => ({
      ...m.family,
      myRole: m.role,
    }));
  }

  static async createFamily(userId: string, name: string) {
    const inviteCode = generateInviteCode(8);

    return await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: {
          name: name.trim(),
          ownerId: userId,
          inviteCode,
        },
      });

      await tx.familyMember.create({
        data: {
          familyId: family.id,
          userId,
          role: "OWNER",
        },
      });

      return family;
    });
  }

  static async joinFamilyByInviteCode(userId: string, inviteCode: string) {
    const family = await prisma.family.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });

    if (!family) {
      throw new Error("Ungültiger Einladungscode.");
    }

    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId,
        },
      },
    });

    if (existingMember) {
      return family;
    }

    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId,
        role: "MEMBER",
      },
    });

    return family;
  }

  static async addChildProfile(userId: string, familyId: string, childName: string) {
    // Verify user is member of family
    const member = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error("Keine Berechtigung für diesen Familienraum.");
    }

    return await prisma.familyMember.create({
      data: {
        familyId,
        childName: childName.trim(),
        role: "CHILD",
      },
    });
  }
}
