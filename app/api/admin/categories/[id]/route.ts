import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { slugify } from "@/lib/slugify";

const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/admin/categories/:id — admin only. `isActive` is a real,
// persisted column on `categories` (not a proxy that hides/shows the
// category's products) — an inactive category simply stops appearing
// in the public /api/categories list and the homepage "Shop by
// Category" grid, while its products and admin data stay untouched.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const categoryId = Number(params.id);
    const data = UpdateCategorySchema.parse(await req.json());

    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) return apiError({ status: 404, message: "Category not found" });

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug) : undefined,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
    });

    return ok({ category });
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
    const categoryId = Number(params.id);
    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return apiError({
        status: 400,
        message: `Cannot delete: ${productCount} product(s) still use this category. Reassign or delete them first.`,
      });
    }
    await prisma.category.delete({ where: { id: categoryId } });
    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
