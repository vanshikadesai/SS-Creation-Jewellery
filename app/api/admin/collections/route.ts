import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const collections = await prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } }, category: true },
    });
    return ok({ collections });
  } catch (err) {
    return apiError(err);
  }
}

const CreateCollectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  // Scope this collection to one category (e.g. "Halo" → Rings) so the
  // admin product form's Collection dropdown and the frontend mega-menu
  // both read the same category → collection mapping. Leave unset for a
  // collection that spans every category (e.g. "Diamond Collection").
  categoryId: z.number().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const data = CreateCollectionSchema.parse(await req.json());
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const [nameTaken, slugTaken] = await Promise.all([
      prisma.collection.findUnique({ where: { name: data.name } }),
      prisma.collection.findUnique({ where: { slug } }),
    ]);
    if (nameTaken) return apiError({ status: 400, message: "A collection with this name already exists." });
    if (slugTaken) return apiError({ status: 400, message: "A collection with this slug already exists." });

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) return apiError({ status: 400, message: "Selected category does not exist." });
    }

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug,
        imageUrl: data.imageUrl ?? undefined,
        categoryId: data.categoryId ?? undefined,
      },
    });
    return ok({ collection }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
