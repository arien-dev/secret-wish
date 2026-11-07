import { NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";
import { ContributeGroupGiftSchema } from "@/lib/validation/schemas";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

interface RouteParams {
  params: Promise<{ shareToken: string; itemId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(ip, {
    keyPrefix: "contribute-gift",
    maxRequests: 30,
    windowMs: 60 * 1000,
  });

  if (!rate.success) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte warte einen Moment." }, { status: 429 });
  }

  try {
    const { shareToken, itemId } = await params;
    const body = await req.json();
    const validated = ContributeGroupGiftSchema.parse(body);

    const cookieStore = await cookies();
    const guestToken = req.headers.get("x-guest-token") || cookieStore.get("secretwish_guest_token")?.value;

    if (!guestToken) {
      return NextResponse.json({ error: "Gast-Token erforderlich." }, { status: 401 });
    }

    const reservation = await ReservationService.contributeGroupGift(
      shareToken,
      itemId,
      guestToken,
      validated.amount
    );

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    if (error.message?.includes("überschreitet das Ziel") || error.message?.includes("vollständig finanziert")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Beitragen." }, { status: 400 });
  }
}
