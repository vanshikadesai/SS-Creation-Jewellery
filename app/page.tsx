import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductRail from "@/components/ProductRail";
import FacetMark from "@/components/FacetMark";
import { prisma } from "@/lib/prisma";

const TESTIMONIALS = [
  {
    name: "Ananya Shah",
    quote:
      "The solitaire I bought for my engagement caught light beautifully — better in person than in photos.",
  },
  {
    name: "Kabir Joshi",
    quote:
      "Ordered a gold chain for my father's birthday. Hallmarking and billing were completely transparent.",
  },
  {
    name: "Riya Patel",
    quote:
      "My bridal set arrived exactly as customised. The team was patient through three rounds of changes.",
  },
];

export default async function HomePage() {
  const [activeBanners, categoryRows, mensPreview] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
    prisma.product.findFirst({
      where: { status: "ACTIVE", gender: "MEN" },
      orderBy: { isFeatured: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  // "Shop by Category" mirrors the real categories table, plus one
  // synthetic Men's Collection tile (gender filter, not a Category row)
  // so it appears alongside the others exactly as in the reference
  // design — its thumbnail is a real men's product photo when one
  // exists, not a stock image.
  const categoryTiles = [
    ...categoryRows.map((c) => ({
      id: c.id,
      name: c.name,
      href: `/shop?category=${c.slug}`,
      imageUrl: c.imageUrl,
    })),
    {
      id: "mens-collection",
      name: "Men's Collection",
      href: "/shop?gender=MEN",
      imageUrl: mensPreview?.images[0]?.url ?? null,
    },
  ];

  return (
    <>
      <HeroSlider banners={activeBanners} />
      <CategoryGrid categories={categoryTiles} />

      <ProductRail
        eyebrow="Handpicked"
        title="Featured Products"
        where={{ isFeatured: true }}
        viewAllHref="/shop?featured=true"
      />
      <ProductRail
        eyebrow="Just In"
        title="New Arrivals"
        where={{ isNewArrival: true }}
        viewAllHref="/shop?sort=newest"
      />
      <ProductRail
        eyebrow="Customer Favourites"
        title="Best Sellers"
        where={{ isBestSeller: true }}
        viewAllHref="/shop?sort=best_selling"
      />
      <ProductRail
        eyebrow="Brilliance, Certified"
        title="Diamond Collection"
        where={{ diamondWeightCt: { gt: 0 } }}
        viewAllHref="/shop?collection=diamond-collection"
      />
      <ProductRail
        eyebrow="Timeless Heritage"
        title="Gold Collection"
        where={{ collection: { slug: "gold-collection" } }}
        viewAllHref="/shop?collection=gold-collection"
      />
      <ProductRail
        eyebrow="For the Aisle"
        title="Bridal Collection"
        where={{ collection: { slug: "bridal-collection" } }}
        viewAllHref="/shop?collection=bridal-collection"
      />
      <ProductRail
        eyebrow="Bold. Refined. Timeless."
        title="Men's Collection"
        where={{ gender: "MEN" }}
        viewAllHref="/shop?gender=MEN"
      />

      {/* About / Company Introduction */}
      <section className="bg-[#F5F1E8] py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <FacetMark className="w-10 h-6 mb-5" />
            <p className="eyebrow mb-3">About Us</p>
            <h2 className="text-3xl md:text-4xl mb-5">The SS Creation Jewellery Story</h2>
            <p className="text-charcoal/70 leading-relaxed mb-4">
              SS Creation Jewellery brings together traditional craftsmanship and modern design, offering
              BIS hallmarked gold and IGI-certified diamond jewellery for every occasion — from everyday
              elegance to once-in-a-lifetime celebrations.
            </p>
            <p className="text-charcoal/70 leading-relaxed">
              Every piece is checked for purity and finish before it reaches you, backed by clear pricing
              and a team that's happy to help you find the right piece for the moment.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-navy text-ivory p-6 aspect-square flex flex-col justify-end">
              <p className="font-display text-3xl text-champagne mb-1">18K–22K</p>
              <p className="text-xs uppercase tracking-wide2 text-ivory/70">Hallmarked Gold Purity</p>
            </div>
            <div className="bg-champagne text-navy p-6 aspect-square flex flex-col justify-end mt-8">
              <p className="font-display text-3xl mb-1">IGI</p>
              <p className="text-xs uppercase tracking-wide2 text-navy/70">Certified Diamonds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SS Creation */}
      <section className="max-w-content mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">Our Promise</p>
          <h2 className="text-3xl md:text-4xl">Why Choose SS Creation</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "Certified Jewellery",
              copy: "BIS hallmarked gold and IGI-certified diamonds on every applicable piece.",
            },
            {
              title: "Free Insured Shipping",
              copy: "Complimentary, insured delivery across India on every order.",
            },
            {
              title: "100% Secure Payments",
              copy: "Your order and payment details are handled securely, every time.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center px-4">
              <FacetMark className="w-9 h-6 mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">{item.title}</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional banner */}
      <section className="bg-emerald text-ivory py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 text-center max-w-xl mx-auto">
          <FacetMark className="w-10 h-6 mx-auto mb-5" />
          <p className="eyebrow text-champagne mb-3">Limited Time</p>
          <h2 className="text-3xl md:text-4xl mb-4">Festive Gold, Fair Making Charges</h2>
          <p className="text-ivory/70 mb-7">
            Flat making-charge discount on select 22K gold pieces this month.
          </p>
          <a href="/shop?collection=gold-collection" className="btn-outline border-champagne text-champagne hover:bg-champagne hover:text-charcoal">
            Explore the Offer
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-content mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">In Their Words</p>
          <h2 className="text-3xl md:text-4xl">What Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-[#F5F1E8] p-8">
              <p className="font-display text-lg italic leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-sm text-charcoal/60">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
