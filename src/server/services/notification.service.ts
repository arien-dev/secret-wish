import { prisma } from "@/lib/db/prisma";

export class NotificationService {
  static async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async markNotificationRead(userId: string, notificationId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  static async markAllNotificationsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
