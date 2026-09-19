import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm, { ProductFormInitial } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, collections, goldRate] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.goldRate.findFirst(),
  ]);

  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    collectionId: product.collectionId ?? "",
    material: product.material,
    goldPurity: product.goldPurity ?? "",
    goldWeightGrams: product.goldWeightGrams?.toString() ?? "",
    diamondWeightCt: product.diamondWeightCt?.toString() ?? "",
    diamondQuality: product.diamondQuality ?? "",
    certification: product.certification ?? "",
    gender: product.gender,
    occasion: product.occasion ?? "",
    price: product.price.toString(),
    originalPrice: product.originalPrice.toString(),
    stockQuantity: product.stockQuantity.toString(),
    lowStockThreshold: product.lowStockThreshold.toString(),
    status: product.status as "ACTIVE" | "DRAFT" | "ARCHIVED",
    description: product.description,
    careInstructions: product.careInstructions ?? "",
    shippingInfo: product.shippingInfo ?? "",
    returnInfo: product.returnInfo ?? "",
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    images: product.images.map((i) => i.url),
    autoGoldPricing: product.autoGoldPricing,
    makingChargeType: product.makingChargeType as "PERCENTAGE" | "FLAT",
    makingChargeValue: product.makingChargeValue.toString(),
    otherChargesAmount: product.otherChargesAmount.toString(),
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Edit Product</h1>
      <ProductForm
        mode="edit"
        initial={initial}
        categories={categories}
        collections={collections}
        currentGoldRate={Number(goldRate?.ratePerGram24k ?? 0)}
      />
    </div>
  );
}
