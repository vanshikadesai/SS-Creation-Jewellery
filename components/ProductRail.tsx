import { prisma } from "@/lib/prisma";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export default async function ProductRail({
  title,
  eyebrow,
  where,
  viewAllHref,
}: {
  title: string;
  eyebrow: string;
  where: Prisma.ProductWhereInput;
  viewAllHref: string;
}) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", ...where },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { slug: true } },
    },
  });

  if (products.length === 0) return null;

  return (
    <section className="max-w-content mx-auto px-4 md:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h2 className="text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link href={viewAllHref} className="text-sm uppercase tracking-wide2 hover:text-champagne-dark">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              slug: p.slug,
              name: p.name,
              material: p.material,
              goldPurity: p.goldPurity,
              price: Number(p.price),
              originalPrice: Number(p.originalPrice),
              discountPercent: p.discountPercent,
              stockQuantity: p.stockQuantity,
              images: p.images,
              isFeatured: p.isFeatured,
              isNewArrival: p.isNewArrival,
              isBestSeller: p.isBestSeller,
              categorySlug: p.category.slug,
              gender: p.gender,
            }}
          />
        ))}
      </div>
    </section>
  );
}
