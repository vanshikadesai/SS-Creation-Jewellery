import Link from "next/link";
import { Gem, Sparkles, IndianRupee } from "lucide-react";
import { CategoryMenuConfig, METAL_OPTIONS, PRICE_BANDS } from "@/lib/nav-data";
import { shopLink } from "@/lib/shop-link";

export interface RealCollection {
  id: number;
  name: string;
  slug: string;
}

export default function CategoryMegaMenu({
  config,
  collections,
}: {
  config: CategoryMenuConfig;
  collections: RealCollection[];
}) {
  // Prefer real, admin-managed collections (Admin → Categories →
  // Collections) for this category. Falls back to the static style
  // list only until the admin has added any — see `npm run
  // seed:collections` to populate them from this same config in one
  // step, or add them individually in the admin UI.
  const styleItems: { label: string; href: string }[] =
    collections.length > 0
      ? collections.map((c) => ({ label: c.name, href: shopLink({ category: config.slug, collection: c.slug }) }))
      : config.styles.map((style) => ({ label: style, href: shopLink({ category: config.slug, q: style }) }));

  return (
    <div
      role="menu"
      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[520px] max-w-[90vw] bg-[#0F172A] text-ivory rounded-lg shadow-2xl border border-white/10 p-6 z-50"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-champagne mb-3">
            <Sparkles size={13} /> {config.styleLabel}
          </p>
          <ul className="space-y-2">
            {styleItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-ivory/80 hover:text-champagne transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-champagne mb-3">
            <Gem size={13} /> Shop by Occasion
          </p>
          <ul className="space-y-2">
            {config.occasions.map((occ) => (
              <li key={occ}>
                <Link
                  href={shopLink({ category: config.slug, occasion: occ })}
                  className="text-sm text-ivory/80 hover:text-champagne transition-colors"
                >
                  {occ}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-px bg-white/10 my-5" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-wide2 text-champagne mb-3">Shop by Metal</p>
          <div className="flex flex-wrap gap-2">
            {METAL_OPTIONS.map((metal) => (
              <Link
                key={metal}
                href={shopLink({ category: config.slug, material: metal })}
                className="text-xs border border-white/15 rounded-full px-3 py-1 text-ivory/80 hover:border-champagne hover:text-champagne transition-colors"
              >
                {metal}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-champagne mb-3">
            <IndianRupee size={12} /> Shop by Price
          </p>
          <ul className="space-y-2">
            {PRICE_BANDS.map((band) => (
              <li key={band.label}>
                <Link
                  href={shopLink({ category: config.slug, minPrice: band.min, maxPrice: band.max })}
                  className="text-sm text-ivory/80 hover:text-champagne transition-colors"
                >
                  {band.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 text-right">
        <Link
          href={shopLink({ category: config.slug })}
          className="text-xs uppercase tracking-wide2 text-champagne hover:underline"
        >
          View All Filters →
        </Link>
      </div>
    </div>
  );
}
