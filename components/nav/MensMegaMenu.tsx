import Link from "next/link";
import { Circle, Link2, Gem, Sparkles, Watch, Diamond } from "lucide-react";
import { MENS_CATEGORY_LINKS } from "@/lib/nav-data";
import { shopLink } from "@/lib/shop-link";
import { formatINR } from "@/lib/format";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";

const ICONS: Record<string, React.ElementType> = {
  "Men's Rings": Circle,
  "Men's Bracelets": Link2,
  "Men's Chains": Link2,
  "Men's Pendants": Gem,
  "Men's Studs": Sparkles,
  "Men's Watches": Watch,
};

export interface MensPreviewProduct {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  image: string | null;
}

export default function MensMegaMenu({ products }: { products: MensPreviewProduct[] }) {
  function linkFor(item: (typeof MENS_CATEGORY_LINKS)[number]) {
    return item.mode === "category"
      ? shopLink({ gender: "MEN", category: item.value })
      : shopLink({ gender: "MEN", q: item.value });
  }

  return (
    <div
      role="menu"
      className="absolute right-0 top-full mt-3 w-[600px] max-w-[92vw] bg-[#0F172A] text-ivory rounded-lg shadow-2xl border border-white/10 p-6 z-50"
    >
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide2 text-champagne mb-4">
        <Diamond size={13} /> Explore Men&rsquo;s Collection
      </p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-5">
        {MENS_CATEGORY_LINKS.map((item) => {
          const Icon = ICONS[item.label] ?? Gem;
          return (
            <Link
              key={item.label}
              href={linkFor(item)}
              className="flex items-center gap-2.5 text-sm text-ivory/85 hover:text-champagne transition-colors py-1"
            >
              <Icon size={15} className="text-champagne/80 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {products.length > 0 && (
        <>
          <div className="h-px bg-white/10 mb-5" />
          <div className="grid grid-cols-5 gap-3">
            {products.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group text-center"
              >
                <div className="aspect-square bg-white/5 rounded overflow-hidden mb-1.5">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fallbackSrc={categoryPlaceholder(null, "MEN")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-[11px] text-ivory/80 truncate">{p.name}</p>
                <p className="text-[11px] text-champagne">{formatINR(p.price)}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 pt-4 border-t border-white/10 text-right">
        <Link
          href={shopLink({ gender: "MEN" })}
          className="text-xs uppercase tracking-wide2 text-champagne hover:underline"
        >
          Shop All Men&rsquo;s Collection →
        </Link>
      </div>
    </div>
  );
}
