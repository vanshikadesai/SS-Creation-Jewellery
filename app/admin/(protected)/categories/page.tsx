import { prisma } from "@/lib/prisma";
import CategoriesClient from "@/components/admin/CategoriesClient";

export const metadata = { title: "Categories | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Categories &amp; Collections</h1>
      <CategoriesClient
        initialCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          isActive: c.isActive,
          productCount: c._count.products,
        }))}
        initialCollections={collections.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          categoryId: c.categoryId,
          productCount: c._count.products,
        }))}
        categoryOptions={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
