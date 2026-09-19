import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FacetMark from "./FacetMark";
import SafeImage from "./SafeImage";

export interface CategoryGridItem {
  id: number | string;
  name: string;
  href: string;
  imageUrl: string | null;
}

// Category images are managed from Admin → Categories → (upload image)
// and stored on Category.imageUrl — nothing here is hard-coded. A
// category with no image uploaded yet falls back to a plain champagne
// initial-letter circle (no <img>), so the row never shows a broken
// image icon while the admin is still filling in real photography.
export default function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="max-w-content mx-auto px-4 md:px-8 py-16">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow mb-2">Browse</p>
        <h2 className="text-3xl md:text-4xl">Shop by Category</h2>
      </div>
      <div className="flex gap-6 md:gap-10 overflow-x-auto md:justify-center px-2 pb-2 no-scrollbar">
        {categories.map((c) => (
          <Link key={c.id} href={c.href} className="group shrink-0 w-24 md:w-28 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden bg-[#F3EEE3] border border-champagne/30 group-hover:border-champagne transition-colors flex items-center justify-center">
              {c.imageUrl ? (
                <SafeImage src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-2xl text-champagne-dark">{c.name.charAt(0)}</span>
              )}
            </div>
            <p className="mt-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 text-charcoal group-hover:text-champagne-dark transition-colors">
              {c.name}
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
