import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateItemSchema } from "@/lib/validation/schemas";
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
    const body = await req.json();
    const validated = CreateItemSchema.parse(body);

    const item = await ItemService.addItem(id, user.id, validated as any);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Hinzufügen des Wunsches." }, { status: 400 });
  }
}
