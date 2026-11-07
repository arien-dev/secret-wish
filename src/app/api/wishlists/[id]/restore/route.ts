import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { WishlistService } from "@/server/services/wishlist.service";

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
    const wishlist = await WishlistService.restoreWishlist(id, user.id);
    return NextResponse.json({ wishlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Wiederherstellen." }, { status: 400 });
  }
}
