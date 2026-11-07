import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/server/services/notification.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const notifications = await NotificationService.getUserNotifications(user.id);
  return NextResponse.json({ notifications });
}
