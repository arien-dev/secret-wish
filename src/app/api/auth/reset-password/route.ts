import { NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/lib/validation/schemas";
import { AuthService } from "@/server/services/auth.service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(ip, {
      keyPrefix: "auth-reset",
      maxRequests: 5,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte warte einen Moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = ResetPasswordSchema.parse(body);

    const result = await AuthService.resetPassword(validated.token, validated.password);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Passwort konnte nicht zurückgesetzt werden." }, { status: 400 });
  }
}
