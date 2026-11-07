import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ shareToken: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { shareToken } = await params;
    const cookieStore = await cookies();
    const guestToken = req.headers.get("x-guest-token") || cookieStore.get("secretwish_guest_token")?.value;

    if (!guestToken) {
      return NextResponse.json({ reservations: [] });
    }

    const reservations = await ReservationService.getGuestReservations(shareToken, guestToken);
    return NextResponse.json({ reservations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Abrufen der Reservierungen." }, { status: 400 });
  }
}
