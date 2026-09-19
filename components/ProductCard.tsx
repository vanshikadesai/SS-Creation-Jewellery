"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "./SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  material: string;
  goldPurity: string | null;
  price: number;
  originalPrice: number;
  discountPercent: number;
  stockQuantity: number;
  images: { url: string; altText: string | null }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  /** Category slug (e.g. "rings") — picks a category-matched fallback icon when the product has no photo yet. */
  categorySlug?: string | null;
  gender?: string | null;
}

export default function ProductCard({
  product,
  initialWishlisted = false,
}: {
  product: ProductCardData;
  initialWishlisted?: boolean;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishBusy, setWishBusy] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "busy" | "done">("idle");
  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;

  // One badge per card, in priority order — driven entirely by the
  // real isNewArrival / isBestSeller / isFeatured flags already on the
  // Product model (set from Admin → Products), not invented labels.
  const badge = product.isNewArrival
    ? "NEW"
    : product.isBestSeller
    ? "BESTSELLER"
    : product.isFeatured
    ? "PREMIUM"
    : null;

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishBusy(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.ok) setWishlisted((v) => !v);
    } finally {
      setWishBusy(false);
    }
  }

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock || cartState === "busy") return;
    setCartState("busy");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.ok) {
        setCartState("done");
        router.refresh();
        setTimeout(() => setCartState("idle"), 1800);
      } else {
        setCartState("idle");
      }
    } catch {
      setCartState("idle");
    }
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square bg-navy overflow-hidden mb-3">
        <SafeImage
          src={image}
          alt={product.name}
          fallbackSrc={categoryPlaceholder(product.categorySlug, product.gender)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-champagne text-navy text-[10px] uppercase tracking-wide2 font-semibold px-2 py-1">
            {badge}
          </span>
        )}
        <button
          onClick={toggleWishlist}
          disabled={wishBusy}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 bg-ivory/90 rounded-full p-2 hover:bg-ivory transition-colors"
        >
          <Heart
            size={16}
            fill={wishlisted ? "#C9A857" : "none"}
            stroke={wishlisted ? "#C9A857" : "#1C1A17"}
          />
        </button>
        {!inStock && (
          <span className="absolute bottom-3 left-3 bg-ivory text-charcoal text-[10px] uppercase tracking-wide2 px-2 py-1">
            Out of Stock
          </span>
        )}
        {inStock && (
          <button
            onClick={addToCart}
            disabled={cartState === "busy"}
            className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-charcoal text-ivory text-xs uppercase tracking-wide2 py-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-emerald"
          >
            {cartState === "done" ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={14} /> Add to Cart
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-charcoal/50 mb-1">
        {product.material}
        {product.goldPurity ? ` · ${product.goldPurity}` : ""}
      </p>
      <h3 className="font-display text-lg leading-snug mb-1">{product.name}</h3>
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
        {product.discountPercent > 0 && (
          <>
            <span className="text-charcoal/40 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="bg-champagne/15 text-champagne-dark text-[10px] font-semibold uppercase tracking-wide2 px-1.5 py-0.5">
              {product.discountPercent}% Off
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
