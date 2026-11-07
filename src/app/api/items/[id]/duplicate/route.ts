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
    const duplicated = await ItemService.duplicateItem(id, user.id);
    return NextResponse.json({ item: duplicated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Duplizieren." }, { status: 400 });
  }
}
