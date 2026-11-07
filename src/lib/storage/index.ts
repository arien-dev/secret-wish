import fs from "fs/promises";
import path from "path";
import { generateSecureToken } from "../crypto";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface SaveFileResult {
  url: string;
  filename: string;
  size: number;
}

/**
 * Validates and saves an uploaded image buffer to local storage.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  mimeType: string
): Promise<SaveFileResult> {
  const extension = ALLOWED_MIME_TYPES.get(mimeType);
  if (!extension) {
    throw new Error("Ungültiges Dateiformat. Erlaubt sind JPG, PNG, WEBP und GIF.");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Die Datei überschreitet die maximale Größe von 5 MB.");
  }

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${generateSecureToken(8)}${extension}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}
