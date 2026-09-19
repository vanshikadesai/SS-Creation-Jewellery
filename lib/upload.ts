import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Product/banner photography is saved straight onto the server's disk
// under /public/uploads/**, exactly like /public/images/placeholder.svg
// already ships today. The returned URL (e.g. "/uploads/products/xyz.jpg")
// is a normal public path — SafeImage and every existing <img src=...>
// render it with zero changes, and it costs nothing to run because it
// never leaves the server the app is already deployed on.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB per image

export class UploadError extends Error {
  status = 400;
}

function extFor(mimeType: string, fallbackName: string) {
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return byMime[mimeType] ?? path.extname(fallbackName) ?? ".jpg";
}

/**
 * Saves a single uploaded File (from a multipart FormData request) to
 * /public/uploads/<subdir>/ and returns its public URL path.
 */
export async function saveUploadedImage(
  file: File,
  subdir: "products" | "banners" | "categories"
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Only JPG, PNG, WEBP or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image must be smaller than 8MB.");
  }

  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${unique}${extFor(file.type, file.name)}`;
  const filePath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${subdir}/${filename}`;
}
