import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validation/schemas";
import { AuthService } from "@/server/services/auth.service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(ip, {
      keyPrefix: "auth-register",
      maxRequests: 5,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Zu viele Registrierungsversuche. Bitte versuche es in einer Minute erneut." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const user = await AuthService.register(validated);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Registrierung fehlgeschlagen." }, { status: 400 });
  }
}
