"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, ShoppingBag, Check } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";
import { formatINR } from "@/lib/format";

export interface WishlistItemData {
  id: number;
  product: {
    id: number;
    slug: string;
    name: string;
    material: string;
    goldPurity: string | null;
    price: number;
    originalPrice: number;
    stockQuantity: number;
    images: { url: string; altText: string | null }[];
    categorySlug?: string | null;
    gender?: string | null;
  };
}

export default function WishlistClient({
  initialItems,
}: {
  initialItems: WishlistItemData[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cartDone, setCartDone] = useState<number | null>(null);

  async function removeItem(productId: number, itemId: number) {
    setBusyId(itemId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function addToCart(productId: number, itemId: number) {
    setBusyId(itemId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setCartDone(itemId);
        router.refresh();
        setTimeout(() => setCartDone(null), 1800);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-border">
        <p className="font-display text-2xl mb-2">Your wishlist is empty.</p>
        <p className="text-charcoal/60 text-sm mb-8">
          Save pieces you&apos;re dreaming about for later.
        </p>
        <Link href="/shop" className="btn-primary">
          Explore Jewellery
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {items.map((item) => {
        const p = item.product;
        const busy = busyId === item.id;
        const inStock = p.stockQuantity > 0;
        return (
          <div key={item.id} className="border border-border p-4">
            <div className="relative">
              <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-[#F5F1E8] overflow-hidden mb-3">
                <SafeImage
                  src={p.images[0]?.url}
                  alt={p.name}
                  fallbackSrc={categoryPlaceholder(p.categorySlug, p.gender)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>
              <button
                onClick={() => removeItem(p.id, item.id)}
                disabled={busy}
                aria-label="Remove from wishlist"
                className="absolute top-2 right-2 bg-ivory/90 rounded-full p-2 hover:bg-ivory transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-charcoal/50 mb-1">
              {p.material}
              {p.goldPurity ? ` · ${p.goldPurity}` : ""}
            </p>
            <Link href={`/product/${p.slug}`} className="font-display text-lg leading-snug block mb-1 hover:text-champagne-dark">
              {p.name}
            </Link>
            <p className="font-semibold mb-3">{formatINR(p.price)}</p>
            <button
              onClick={() => addToCart(p.id, item.id)}
              disabled={busy || !inStock}
              className="btn-outline w-full gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              {cartDone === item.id ? (
                <>
                  <Check size={15} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={15} /> {inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
