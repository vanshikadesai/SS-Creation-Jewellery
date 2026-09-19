"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";
import { formatINR } from "@/lib/format";

export interface CartItemData {
  id: number;
  quantity: number;
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

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CartClient({
  initialItems,
  initialSummary,
}: {
  initialItems: CartItemData[];
  initialSummary: CartSummary;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function refresh() {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setSummary(data.summary);
      router.refresh();
    }
  }

  async function updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    setBusyId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(itemId: number) {
    setBusyId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) await refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-border">
        <p className="font-display text-2xl mb-2">Your cart is empty.</p>
        <p className="text-charcoal/60 text-sm mb-8">
          Discover pieces you&apos;ll love.
        </p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <div className="divide-y divide-border">
        {items.map((item) => {
          const p = item.product;
          const busy = busyId === item.id;
          return (
            <div key={item.id} className="flex gap-4 py-6">
              <Link
                href={`/product/${p.slug}`}
                className="relative w-24 h-24 bg-[#F5F1E8] overflow-hidden shrink-0"
              >
                <SafeImage
                  src={p.images[0]?.url}
                  alt={p.name}
                  fallbackSrc={categoryPlaceholder(p.categorySlug, p.gender)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/product/${p.slug}`} className="font-display text-lg hover:text-champagne-dark">
                      {p.name}
                    </Link>
                    <p className="text-xs text-charcoal/50 mt-1">
                      {p.material}
                      {p.goldPurity ? ` · ${p.goldPurity}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={busy}
                    aria-label="Remove item"
                    className="text-charcoal/40 hover:text-rosedust h-fit"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-charcoal">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={busy || item.quantity <= 1}
                      className="p-2 hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={busy || item.quantity >= p.stockQuantity}
                      className="p-2 hover:bg-charcoal hover:text-ivory transition-colors disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <p className="font-semibold">{formatINR(p.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-border p-6 h-fit space-y-4">
        <h2 className="font-display text-xl mb-2">Order Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Subtotal</span>
          <span>{formatINR(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-emerald">
            <span>Discount</span>
            <span>-{formatINR(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Estimated GST (3%)</span>
          <span>{formatINR(summary.tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Shipping</span>
          <span>{summary.shipping === 0 ? "Complimentary" : formatINR(summary.shipping)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-border pt-4">
          <span>Estimated Total</span>
          <span>{formatINR(summary.total)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full mt-2">
          Proceed to Checkout
        </Link>
        <Link
          href="/shop"
          className="block text-center text-sm text-charcoal/60 hover:text-champagne-dark mt-2"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
