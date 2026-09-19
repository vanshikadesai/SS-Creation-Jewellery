"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import HoverNavItem from "@/components/nav/HoverNavItem";
import CategoryMegaMenu from "@/components/nav/CategoryMegaMenu";
import MensMegaMenu, { MensPreviewProduct } from "@/components/nav/MensMegaMenu";
import { CATEGORY_MENUS, MENS_CATEGORY_LINKS } from "@/lib/nav-data";
import { shopLink } from "@/lib/shop-link";

// Plain (non-dropdown) links, unchanged from before this update.
const SIMPLE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Diamond", href: "/shop?collection=diamond-collection" },
  { label: "Gold", href: "/shop?collection=gold-collection" },
];
const TAIL_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Premium dark-navy + bold for every top-level nav link (not just
// Men's Collection), per the site's updated navbar spec. `active`
// layers on the champagne underline/color so the current section is
// clearly visible without changing the base palette.
function navLinkClass(active: boolean) {
  return `text-ivory/90 font-semibold transition-colors hover:text-champagne ${
    active ? "text-champagne" : ""
  }`;
}

export default function HeaderNav({
  mensProducts,
  categoryCollections,
  cartCount = 0,
}: {
  mensProducts: MensPreviewProduct[];
  categoryCollections: Record<string, { id: number; name: string; slug: string }[]>;
  cartCount?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isShop = pathname === "/shop";
  const activeCollection = searchParams.get("collection");
  const activeCategory = searchParams.get("category");
  const activeGender = searchParams.get("gender");

  function isSimpleLinkActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/shop") return isShop && !activeCollection && !activeCategory && !activeGender;
    if (href.includes("diamond-collection")) return isShop && activeCollection === "diamond-collection";
    if (href.includes("gold-collection")) return isShop && activeCollection === "gold-collection";
    return pathname === href;
  }

  return (
    <>
      <button className="lg:hidden text-ivory" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <Menu size={22} />
      </button>

      <Link href="/" className="flex items-center mx-auto lg:mx-0" aria-label="SS Creation Jewellery — Home">
        <Image
          src="/images/logo.png"
          alt="SS Creation Jewellery"
          width={180}
          height={115}
          priority
          className="h-11 md:h-14 w-auto object-contain"
        />
      </Link>

      <nav className="hidden lg:flex items-center gap-6 text-sm">
        {SIMPLE_LINKS.map((link) => (
          <Link key={link.label} href={link.href} className={navLinkClass(isSimpleLinkActive(link.href))}>
            {link.label}
          </Link>
        ))}

        {CATEGORY_MENUS.map((config) => (
          <HoverNavItem
            key={config.slug}
            label={config.label}
            href={shopLink({ category: config.slug })}
            active={isShop && activeCategory === config.slug}
            menu={<CategoryMegaMenu config={config} collections={categoryCollections[config.slug] ?? []} />}
          />
        ))}

        <HoverNavItem
          label="Men's Collection"
          href={shopLink({ gender: "MEN" })}
          highlighted
          active={isShop && activeGender === "MEN"}
          menu={<MensMegaMenu products={mensProducts} />}
        />

        {TAIL_LINKS.map((link) => (
          <Link key={link.label} href={link.href} className={navLinkClass(pathname === link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button aria-label="Search" className="text-ivory hover:text-champagne transition-colors">
          <Search size={20} />
        </button>
        <Link href="/login" aria-label="Account" className="text-ivory hover:text-champagne transition-colors">
          <User size={20} />
        </Link>
        <Link href="/account/wishlist" aria-label="Wishlist" className="text-ivory hover:text-champagne transition-colors">
          <Heart size={20} />
        </Link>
        <Link href="/cart" aria-label="Cart" className="text-ivory hover:text-champagne transition-colors relative">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-champagne text-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-72 bg-ivory p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="mb-6">
              <X size={22} />
            </button>
            <nav className="flex flex-col gap-1">
              {SIMPLE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base py-2"
                >
                  {link.label}
                </Link>
              ))}

              {CATEGORY_MENUS.map((config) => {
                const expanded = mobileExpanded === config.slug;
                return (
                  <div key={config.slug} className="border-t border-border/60 first:border-t-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={shopLink({ category: config.slug })}
                        onClick={() => setMenuOpen(false)}
                        className="text-base py-2 flex-1"
                      >
                        {config.label}
                      </Link>
                      <button
                        aria-label={`Toggle ${config.label} filters`}
                        onClick={() => setMobileExpanded(expanded ? null : config.slug)}
                        className="p-2"
                      >
                        <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    {expanded && (
                      <div className="pl-3 pb-3 flex flex-col gap-1.5">
                        {config.occasions.map((occ) => (
                          <Link
                            key={occ}
                            href={shopLink({ category: config.slug, occasion: occ })}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-charcoal/70 py-1"
                          >
                            {config.label} · {occ}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Link
                    href={shopLink({ gender: "MEN" })}
                    onClick={() => setMenuOpen(false)}
                    className="text-base py-2 flex-1 font-semibold text-[#1B2A4A]"
                  >
                    Men&rsquo;s Collection
                  </Link>
                  <button
                    aria-label="Toggle Men's Collection categories"
                    onClick={() => setMobileExpanded(mobileExpanded === "mens" ? null : "mens")}
                    className="p-2"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${mobileExpanded === "mens" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {mobileExpanded === "mens" && (
                  <div className="pl-3 pb-3 flex flex-col gap-1.5">
                    {MENS_CATEGORY_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        href={
                          item.mode === "category"
                            ? shopLink({ gender: "MEN", category: item.value })
                            : shopLink({ gender: "MEN", q: item.value })
                        }
                        onClick={() => setMenuOpen(false)}
                        className="text-sm text-charcoal/70 py-1"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {TAIL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base py-2 border-t border-border/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
