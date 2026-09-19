import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const UpdateBannerSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  imageUrl: z.string().min(1).optional(),
  linkUrl: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = Number(params.id);
    const data = UpdateBannerSchema.parse(await req.json());

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return apiError({ status: 404, message: "Banner not found" });

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl ?? undefined,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
    return ok({ banner });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    await prisma.banner.delete({ where: { id: Number(params.id) } });
    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
