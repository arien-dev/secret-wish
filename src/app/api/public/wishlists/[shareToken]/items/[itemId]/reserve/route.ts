import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { ReserveItemSchema } from "@/lib/validation/schemas";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ shareToken: string; itemId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(ip, {
    keyPrefix: "reserve-item",
    maxRequests: 30,
    windowMs: 60 * 1000,
  });

  if (!rate.success) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte warte einen Moment." }, { status: 429 });
  }

  try {
    const { shareToken, itemId } = await params;
    const body = await req.json().catch(() => ({}));
    const validated = ReserveItemSchema.parse(body);

    const cookieStore = await cookies();
    const guestToken = req.headers.get("x-guest-token") || cookieStore.get("secretwish_guest_token")?.value;

    if (!guestToken) {
      return NextResponse.json({ error: "Gast-Token erforderlich." }, { status: 401 });
    }

    const reservation = await ReservationService.reserveItem(
      shareToken,
      itemId,
      guestToken,
      validated.quantity
    );

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    // If conflict / overbooking
    if (error.message?.includes("nicht mehr in der gewünschten Anzahl verfügbar")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Reservieren." }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { shareToken, itemId } = await params;
    const cookieStore = await cookies();
    const guestToken = req.headers.get("x-guest-token") || cookieStore.get("secretwish_guest_token")?.value;

    if (!guestToken) {
      return NextResponse.json({ error: "Gast-Token erforderlich." }, { status: 401 });
    }

    await ReservationService.cancelReservation(shareToken, itemId, guestToken);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Freigeben." }, { status: 400 });
  }
}
