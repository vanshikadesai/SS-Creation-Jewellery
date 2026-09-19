import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { saveUploadedImage, UploadError } from "@/lib/upload";

// POST /api/admin/upload — admin only. Accepts multipart/form-data with
// one or more "file" entries plus an optional "type" field
// (products | banners | categories, defaults to "products") and saves
// each straight to /public/uploads/<type>/, returning the public URLs
// the product/banner form can store on the record it's editing.
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const form = await req.formData();
    const type = (form.get("type") as string) || "products";
    if (!["products", "banners", "categories"].includes(type)) {
      return apiError({ status: 400, message: "Invalid upload type." });
    }

    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return apiError({ status: 400, message: "No file provided." });
    }

    const urls = await Promise.all(
      files.map((file) => saveUploadedImage(file, type as "products" | "banners" | "categories"))
    );

    return ok({ urls }, 201);
  } catch (err) {
    if (err instanceof UploadError) {
      return apiError({ status: err.status, message: err.message });
    }
    return apiError(err);
  }
}
