import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });
    return ok({ banners });
  } catch (err) {
    return apiError(err);
  }
}

const CreateBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().min(1),
  linkUrl: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// POST /api/admin/banners — admin only. An active banner appears on
// the homepage hero slider immediately (see app/page.tsx, which now
// reads banners from this table with a static fallback if none exist).
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const data = CreateBannerSchema.parse(await req.json());
    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl ?? undefined,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return ok({ banner }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
