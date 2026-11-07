import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

interface RouteParams {
  params: Promise<{ shareToken: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(ip, {
    keyPrefix: "public-wishlist",
    maxRequests: 60,
    windowMs: 60 * 1000,
  });

  if (!rate.success) {
    return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });
  }

  const { shareToken } = await params;

  // Extract guest token from header or cookie
  const cookieStore = await cookies();
  const guestTokenHeader = req.headers.get("x-guest-token");
  const guestTokenCookie = cookieStore.get("secretwish_guest_token")?.value;
  const guestToken = guestTokenHeader || guestTokenCookie || null;

  const wishlist = await ReservationService.getPublicWishlist(shareToken, guestToken);

  if (!wishlist) {
    return NextResponse.json({ error: "Wunschliste nicht gefunden oder Link ungültig." }, { status: 404 });
  }

  return NextResponse.json({ wishlist });
}
