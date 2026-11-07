import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UpdateWishlistSchema } from "@/lib/validation/schemas";
import { WishlistService } from "@/server/services/wishlist.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const { id } = await params;
  const wishlist = await WishlistService.getWishlistById(id, user.id);

  if (!wishlist) {
    return NextResponse.json({ error: "Wunschliste nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ wishlist });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = UpdateWishlistSchema.parse(body);

    const updated = await WishlistService.updateWishlist(id, user.id, validated as any);
    return NextResponse.json({ wishlist: updated });
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
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent") === "true";

    if (permanent) {
      await WishlistService.permanentlyDeleteWishlist(id, user.id);
    } else {
      await WishlistService.softDeleteWishlist(id, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Löschen." }, { status: 400 });
  }
}
