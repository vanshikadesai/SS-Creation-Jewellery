import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { slugify } from "@/lib/slugify";

const UpdateCollectionSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  categoryId: z.number().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = Number(params.id);
    const data = UpdateCollectionSchema.parse(await req.json());

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) return apiError({ status: 404, message: "Collection not found" });

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) return apiError({ status: 400, message: "Selected category does not exist." });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug) : undefined,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId === undefined ? undefined : data.categoryId,
      },
    });
    return ok({ collection });
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
    const id = Number(params.id);
    const productCount = await prisma.product.count({ where: { collectionId: id } });
    if (productCount > 0) {
      return apiError({
        status: 400,
        message: `Cannot delete: ${productCount} product(s) still use this collection.`,
      });
    }
    await prisma.collection.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
