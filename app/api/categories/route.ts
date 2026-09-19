import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/categories — public, used by the Shop page filter sidebar and
// any future navigation/menu building. Read-only; category management
// stays an admin (Phase 3) concern.
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return ok({ categories });
  } catch (err) {
    return apiError(err);
  }
}
