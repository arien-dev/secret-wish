import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { JoinFamilySchema } from "@/lib/validation/schemas";
import { FamilyService } from "@/server/services/family.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = JoinFamilySchema.parse(body);

    const family = await FamilyService.joinFamilyByInviteCode(user.id, validated.inviteCode);
    return NextResponse.json({ success: true, family });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Beitreten." }, { status: 400 });
  }
}
