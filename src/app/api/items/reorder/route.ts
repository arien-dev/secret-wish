import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ReorderItemsSchema } from "@/lib/validation/schemas";
import { ItemService } from "@/server/services/item.service";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = ReorderItemsSchema.parse(body);

    const wishlistId = body.wishlistId;
    if (!wishlistId) {
      return NextResponse.json({ error: "wishlistId ist erforderlich." }, { status: 400 });
    }

    await ItemService.reorderItems(wishlistId, user.id, validated.items);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Sortieren." }, { status: 400 });
  }
}
