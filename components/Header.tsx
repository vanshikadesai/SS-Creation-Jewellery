import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import HeaderNav from "@/components/HeaderNav";
import { CATEGORY_MENUS } from "@/lib/nav-data";
import { getServerAuthUser } from "@/lib/auth";

export default async function Header() {
  const authUser = getServerAuthUser();

  const [mensProductRows, categoriesWithCollections, cartItemCount] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", gender: "MEN" as const },
      orderBy: { isFeatured: "desc" },
      take: 5,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    // Real collections scoped to each of the 6 jewellery categories
    // (e.g. Halo/Band/Cocktail → Rings), so the "Shop by Style" section
    // of the mega-menu reads the exact same data Admin → Categories →
    // Collections manages — no separate hard-coded style list.
    prisma.category.findMany({
      where: { slug: { in: CATEGORY_MENUS.map((c) => c.slug) }, isActive: true },
      include: { collections: { orderBy: { name: "asc" } } },
    }),
    // Cart badge count — only queried for a logged-in user; guests see
    // no badge rather than a fake "0" every render.
    authUser
      ? prisma.cartItem.aggregate({
          _sum: { quantity: true },
          where: { cart: { userId: authUser.userId } },
        })
      : null,
  ]);

  const mensProducts = mensProductRows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toString(),
    image: p.images[0]?.url ?? null,
  }));

  const categoryCollections: Record<string, { id: number; name: string; slug: string }[]> = {};
  for (const cat of categoriesWithCollections) {
    categoryCollections[cat.slug] = cat.collections.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  }

  return (
    <header className="sticky top-0 z-40 bg-navy border-b border-white/10">
      <div className="max-w-content mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        {/* useSearchParams() inside HeaderNav (for the active-nav-item
        highlight) requires a Suspense boundary, since Header renders
        inside the root layout on every page. The fallback is
        effectively invisible in practice — nothing here is actually
        async/slow, this only satisfies Next's static-rendering rules. */}
        <Suspense fallback={null}>
          <HeaderNav
            mensProducts={mensProducts}
            categoryCollections={categoryCollections}
            cartCount={cartItemCount?._sum.quantity ?? 0}
          />
        </Suspense>
      </div>
    </header>
  );
}
