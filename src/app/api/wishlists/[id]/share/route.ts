import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { WishlistService } from "@/server/services/wishlist.service";
import { CustomSlugSchema } from "@/lib/validation/schemas";

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

    // Eigener, benutzerdefinierter Slug
    if (body.slug !== undefined && body.slug !== null && body.slug !== "") {
      const validated = CustomSlugSchema.parse(body.slug);
      const updated = await WishlistService.setCustomSlug(id, user.id, validated);
      return NextResponse.json({ shareToken: updated.slug });
    }

    // Zufälliger neuer Link (alte explizit zurückgesetzt)
    const result = await WishlistService.regenerateShareToken(id, user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Ungültiger Link-Name." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Aktualisieren des Links." }, { status: 400 });
  }
}
