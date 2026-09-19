import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import ProductGallery from "@/components/product/ProductGallery";
import ProductActions from "@/components/product/ProductActions";
import ProductCard from "@/components/ProductCard";
import { Star } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "Product Not Found | SS Creation Jewellery" };
  return {
    title: `${product.name} | SS Creation Jewellery`,
    description: product.description.slice(0, 155),
  };
}

const SPEC_ROWS: { label: string; value: (p: NonNullable<Awaited<ReturnType<typeof getProduct>>>) => string | null }[] = [
  { label: "SKU", value: (p) => p.sku },
  { label: "Material", value: (p) => p.material },
  { label: "Gold Purity", value: (p) => p.goldPurity },
  { label: "Gold Weight", value: (p) => (p.goldWeightGrams ? `${p.goldWeightGrams} g` : null) },
  { label: "Diamond Weight", value: (p) => (p.diamondWeightCt ? `${p.diamondWeightCt} ct` : null) },
  { label: "Diamond Quality", value: (p) => p.diamondQuality },
  { label: "Certification", value: (p) => p.certification },
  { label: "Occasion", value: (p) => p.occasion },
];

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      collection: true,
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const authUser = getServerAuthUser();

  const [relatedRaw, wishlistItem] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { slug: true } },
      },
    }),
    authUser
      ? prisma.wishlistItem.findFirst({
          where: { productId: product.id, wishlist: { userId: authUser.userId } },
        })
      : Promise.resolve(null),
  ]);

  let recentlyViewedRaw: typeof relatedRaw = [];
  if (authUser) {
    // Record this view, then pull the customer's recent history (excluding
    // the product they're currently looking at) for the rail below.
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId: authUser.userId, productId: product.id } },
      update: { viewedAt: new Date() },
      create: { userId: authUser.userId, productId: product.id },
    });
    const recent = await prisma.recentlyViewed.findMany({
      where: { userId: authUser.userId, productId: { not: product.id } },
      orderBy: { viewedAt: "desc" },
      take: 4,
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { slug: true } },
          },
        },
      },
    });
    recentlyViewedRaw = recent
      .map((r) => r.product)
      .filter((p) => p.status === "ACTIVE");
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <p className="text-xs text-charcoal/50 mb-8">
        <Link href="/shop" className="hover:text-champagne-dark">
          Shop
        </Link>
        {" / "}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-champagne-dark">
          {product.category.name}
        </Link>
        {" / "}
        <span>{product.name}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery
          images={product.images}
          productName={product.name}
          categorySlug={product.category.slug}
          gender={product.gender}
        />

        <div>
          <p className="eyebrow mb-2">
            {product.material}
            {product.goldPurity ? ` · ${product.goldPurity}` : ""}
          </p>
          <h1 className="text-3xl md:text-4xl mb-3">{product.name}</h1>

          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <div className="flex text-champagne">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < Math.round(avgRating) ? "#C9A857" : "none"}
                    stroke="#C9A857"
                  />
                ))}
              </div>
              <span className="text-charcoal/50">
                {avgRating.toFixed(1)} ({product.reviews.length} review
                {product.reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-charcoal/40 line-through">
                  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                </span>
                <span className="text-xs uppercase tracking-wide2 bg-charcoal text-ivory px-2 py-1">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          <ProductActions
            productId={product.id}
            stockQuantity={product.stockQuantity}
            initialWishlisted={Boolean(wishlistItem)}
          />

          <div className="mt-10 border-t border-border pt-6">
            <p className="eyebrow mb-3">Details</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {SPEC_ROWS.map(({ label, value }) => {
                const v = value(product);
                if (!v) return null;
                return (
                  <div key={label} className="flex justify-between border-b border-border/70 pb-2">
                    <dt className="text-charcoal/50">{label}</dt>
                    <dd className="font-medium text-right">{v}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="mt-8 border-t border-border pt-6 space-y-6">
            <div>
              <p className="eyebrow mb-2">Description</p>
              <p className="text-sm leading-relaxed text-charcoal/80 whitespace-pre-line">
                {product.description}
              </p>
            </div>
            {product.careInstructions && (
              <div>
                <p className="eyebrow mb-2">Care Instructions</p>
                <p className="text-sm leading-relaxed text-charcoal/80 whitespace-pre-line">
                  {product.careInstructions}
                </p>
              </div>
            )}
            {product.shippingInfo && (
              <div>
                <p className="eyebrow mb-2">Shipping Information</p>
                <p className="text-sm leading-relaxed text-charcoal/80 whitespace-pre-line">
                  {product.shippingInfo}
                </p>
              </div>
            )}
            {product.returnInfo && (
              <div>
                <p className="eyebrow mb-2">Return Information</p>
                <p className="text-sm leading-relaxed text-charcoal/80 whitespace-pre-line">
                  {product.returnInfo}
                </p>
              </div>
            )}
          </div>

          {product.reviews.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <p className="eyebrow mb-4">Customer Reviews</p>
              <div className="space-y-5">
                {product.reviews.map((r) => (
                  <div key={r.id} className="border-b border-border/70 pb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-champagne">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? "#C9A857" : "none"} stroke="#C9A857" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{r.title}</span>
                    </div>
                    <p className="text-sm text-charcoal/70 mb-1">{r.body}</p>
                    <p className="text-xs text-charcoal/40">— {r.user.fullName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedRaw.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl mb-8">More from {product.category.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {relatedRaw.map((p) => (
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
      )}

      {recentlyViewedRaw.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {recentlyViewedRaw.map((p) => (
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
      )}
    </div>
  );
}
