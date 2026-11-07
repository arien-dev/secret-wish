import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validation/schemas";
import { AuthService } from "@/server/services/auth.service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(ip, {
      keyPrefix: "auth-login",
      maxRequests: 10,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Zu viele Anmeldeversuche. Bitte warte eine Minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const { user, sessionToken, expiresAt } = await AuthService.login(validated, userAgent, ip);

    const response = NextResponse.json({ success: true, user });

    const cookieOpts = getSessionCookieOptions(expiresAt);
    response.cookies.set(cookieOpts.name, sessionToken, cookieOpts);

    return response;
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Anmeldung fehlgeschlagen." }, { status: 401 });
  }
}
