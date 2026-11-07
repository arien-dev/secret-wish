import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateFamilySchema } from "@/lib/validation/schemas";
import { FamilyService } from "@/server/services/family.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  const families = await FamilyService.getFamiliesForUser(user.id);
  return NextResponse.json({ families });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = CreateFamilySchema.parse(body);

    const family = await FamilyService.createFamily(user.id, validated.name);
    return NextResponse.json({ family }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Erstellen des Familienraums." }, { status: 400 });
  }
}
