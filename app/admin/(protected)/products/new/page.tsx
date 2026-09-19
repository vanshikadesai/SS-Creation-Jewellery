import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add Product | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections, goldRate] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.goldRate.findFirst(),
  ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Add Product</h1>
      <ProductForm
        mode="create"
        categories={categories}
        collections={collections}
        currentGoldRate={Number(goldRate?.ratePerGram24k ?? 0)}
      />
    </div>
  );
}
