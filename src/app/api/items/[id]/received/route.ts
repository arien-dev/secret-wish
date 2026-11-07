import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ItemService } from "@/server/services/item.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isReceived = body.isReceived !== undefined ? Boolean(body.isReceived) : true;

    const item = await ItemService.markReceived(id, user.id, isReceived);
    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Aktualisieren des Status." }, { status: 400 });
  }
}
