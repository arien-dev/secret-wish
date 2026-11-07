import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UpdateItemSchema } from "@/lib/validation/schemas";
import { ItemService } from "@/server/services/item.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = UpdateItemSchema.parse(body);

    const updated = await ItemService.updateItem(id, user.id, validated as any);
    return NextResponse.json({ item: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Aktualisieren." }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await ItemService.deleteItem(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Löschen." }, { status: 400 });
  }
}
