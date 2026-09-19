import { prisma } from "@/lib/prisma";
import InventoryClient from "@/components/admin/InventoryClient";

export const metadata = { title: "Inventory | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { stockQuantity: "asc" },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { slug: true } },
    },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    image: p.images[0]?.url ?? null,
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    categorySlug: p.category.slug,
    gender: p.gender,
  }));

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-6">Inventory</h1>
      <InventoryClient rows={rows} defaultFilter={searchParams.filter === "low" ? "low" : "all"} />
    </div>
  );
}
