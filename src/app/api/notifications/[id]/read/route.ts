import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/server/services/notification.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const { id } = await params;
  await NotificationService.markNotificationRead(user.id, id);
  return NextResponse.json({ success: true });
}
