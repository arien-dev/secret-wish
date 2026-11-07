import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { generateSecureToken } from "@/lib/crypto";
import { GuestSessionSchema } from "@/lib/validation/schemas";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ shareToken: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { shareToken } = await params;
    const body = await req.json().catch(() => ({}));
    const validated = GuestSessionSchema.parse(body);

    const cookieStore = await cookies();
    const existingCookie = cookieStore.get("secretwish_guest_token")?.value;
    const headerToken = req.headers.get("x-guest-token");
    const guestToken = headerToken || existingCookie || generateSecureToken(32);

    await ReservationService.registerGuest(shareToken, guestToken, validated.displayName);

    const response = NextResponse.json({
      success: true,
      guestToken,
      displayName: validated.displayName || null,
    });

    // Set guest cookie (1 year expiry)
    response.cookies.set("secretwish_guest_token", guestToken, {
      httpOnly: false, // Accessible to client-side JS so guest can store in localStorage
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Gastzugang." }, { status: 400 });
  }
}
