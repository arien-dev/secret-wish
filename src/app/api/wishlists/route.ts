import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateWishlistSchema } from "@/lib/validation/schemas";
import { WishlistService } from "@/server/services/wishlist.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const wishlists = await WishlistService.getWishlistsForUser(user.id);
  return NextResponse.json({ wishlists });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = CreateWishlistSchema.parse(body);

    const wishlist = await WishlistService.createWishlist(user.id, validated as any);
    return NextResponse.json({ wishlist }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Erstellen der Wunschliste." }, { status: 400 });
  }
}
