import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { slugify } from "@/lib/slugify";

// GET /api/admin/categories — same data as the public /api/categories
// (name, slug, product counts) but sits under /api/admin for the admin
// nav's consistency; the public route stays untouched for the storefront.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return ok({ categories });
  } catch (err) {
    return apiError(err);
  }
}

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// POST /api/admin/categories — admin only. Creating a category here
// immediately makes it selectable in the product form and available as
// a /shop?category=<slug> filter — same `categories` table the
// storefront and product form both already read from.
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const data = CreateCategorySchema.parse(await req.json());
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const [nameTaken, slugTaken] = await Promise.all([
      prisma.category.findUnique({ where: { name: data.name } }),
      prisma.category.findUnique({ where: { slug } }),
    ]);
    if (nameTaken) return apiError({ status: 400, message: "A category with this name already exists." });
    if (slugTaken) return apiError({ status: 400, message: "A category with this slug already exists." });

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        imageUrl: data.imageUrl ?? undefined,
        isActive: data.isActive ?? true,
      },
    });
    return ok({ category }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
