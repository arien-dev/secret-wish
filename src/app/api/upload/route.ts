import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveUploadedFile(buffer, file.type);

    return NextResponse.json({ success: true, url: result.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fehler beim Upload." }, { status: 400 });
  }
}
