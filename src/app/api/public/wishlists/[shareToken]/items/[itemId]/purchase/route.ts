import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ shareToken: string; itemId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { shareToken, itemId } = await params;
    const cookieStore = await cookies();
    const guestToken = req.headers.get("x-guest-token") || cookieStore.get("secretwish_guest_token")?.value;

    if (!guestToken) {
      return NextResponse.json({ error: "Gast-Token erforderlich." }, { status: 401 });
    }

    const reservation = await ReservationService.markPurchased(shareToken, itemId, guestToken);
    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Aktualisieren." }, { status: 400 });
  }
}
