import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateChildProfileSchema } from "@/lib/validation/schemas";
import { FamilyService } from "@/server/services/family.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = CreateChildProfileSchema.parse(body);

    const child = await FamilyService.addChildProfile(user.id, id, validated.childName);
    return NextResponse.json({ child }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validierungsfehler." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Fehler beim Anlegen des Kinder-Profils." }, { status: 400 });
  }
}
