import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/server/services/notification.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  await NotificationService.markAllNotificationsRead(user.id);
  return NextResponse.json({ success: true });
}
