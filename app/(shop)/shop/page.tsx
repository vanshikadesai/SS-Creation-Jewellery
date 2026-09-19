import { Suspense } from "react";
import { queryProducts, getFilterOptions } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import SortSelect from "@/components/shop/SortSelect";
import SearchBar from "@/components/shop/SearchBar";
import Pagination from "@/components/Pagination";
import FacetMark from "@/components/FacetMark";

export const metadata = {
  title: "Shop All Jewellery | SS Creation Jewellery",
  description:
    "Browse fine gold and diamond jewellery — rings, necklaces, earrings, bangles and bridal collections.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const search = searchParams.search ?? searchParams.q;

  const [result, options, authUser] = await Promise.all([
    queryProducts({
      q: search,
      category: searchParams.category,
      collection: searchParams.collection,
      material: searchParams.material,
      goldPurity: searchParams.goldPurity,
      occasion: searchParams.occasion,
      gender: searchParams.gender,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      inStock: searchParams.inStock,
      featured: searchParams.featured,
      newArrival: searchParams.newArrival,
      bestSeller: searchParams.bestSeller,
      sort: searchParams.sort,
      page: searchParams.page,
    }),
    getFilterOptions(),
    Promise.resolve(getServerAuthUser()),
  ]);

  let wishlistedIds = new Set<number>();
  if (authUser) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: authUser.userId },
      include: { items: { select: { productId: true } } },
    });
    wishlistedIds = new Set(wishlist?.items.map((i) => i.productId) ?? []);
  }

  const { items, pagination } = result;
  const activeCategory = options.categories.find((c) => c.slug === searchParams.category);
  const isMensCollection = searchParams.gender === "MEN";

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow mb-2">Shop</p>
        <h1 className="text-3xl md:text-4xl">
          {isMensCollection && activeCategory
            ? `Men's ${activeCategory.name}`
            : isMensCollection
            ? "Men's Collection"
            : activeCategory
            ? activeCategory.name
            : search
            ? `Results for “${search}”`
            : "All Jewellery"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        <Suspense fallback={null}>
          <ShopFilters options={options} />
        </Suspense>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <SearchBar defaultValue={search} />
            <div className="flex items-center gap-4">
              <p className="text-sm text-charcoal/60">
                {pagination.total} {pagination.total === 1 ? "piece" : "pieces"}
              </p>
              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="font-display text-2xl mb-2">No jewellery found.</p>
              <p className="text-charcoal/60 text-sm">
                Try adjusting or clearing your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  initialWishlisted={wishlistedIds.has(p.id)}
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
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
