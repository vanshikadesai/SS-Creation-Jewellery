import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/collections — public, mirrors /api/categories for collections
// (e.g. "Diamond Collection", "Bridal Collection").
export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return ok({ collections });
  } catch (err) {
    return apiError(err);
  }
}
