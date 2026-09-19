"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Share2, Minus, Plus } from "lucide-react";

export default function ProductActions({
  productId,
  stockQuantity,
  initialWishlisted,
}: {
  productId: number;
  stockQuantity: number;
  initialWishlisted: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "buying" | "error">(
    "idle"
  );
  const inStock = stockQuantity > 0;
  const maxQty = Math.min(10, stockQuantity);

  function goLogin() {
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  }

  async function addToCart(): Promise<boolean> {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    if (res.status === 401) {
      goLogin();
      return false;
    }
    return res.ok;
  }

  async function handleAddToCart() {
    setStatus("adding");
    const success = await addToCart();
    setStatus(success ? "added" : "error");
    if (success) {
      router.refresh();
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  async function handleBuyNow() {
    setStatus("buying");
    const success = await addToCart();
    if (success) {
      router.push("/checkout");
    } else {
      setStatus("error");
    }
  }

  async function toggleWishlist() {
    const res = await fetch("/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.status === 401) {
      goLogin();
      return;
    }
    if (res.ok) setWishlisted((v) => !v);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setStatus("idle");
      alert("Link copied to clipboard");
    }
  }

  return (
    <div className="space-y-5">
      {inStock ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-charcoal">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-3 hover:bg-charcoal hover:text-ivory transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="p-3 hover:bg-charcoal hover:text-ivory transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-charcoal/50">
            {stockQuantity <= 5 ? `Only ${stockQuantity} left` : "In Stock"}
          </span>
        </div>
      ) : (
        <p className="text-sm text-rosedust font-medium">Currently out of stock</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || status === "adding"}
          className="btn-outline flex-1 gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ShoppingBag size={16} />
          {status === "added" ? "Added to Cart" : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock || status === "buying"}
          className="btn-primary flex-1 disabled:opacity-40 disabled:pointer-events-none"
        >
          {status === "buying" ? "Please wait…" : "Buy Now"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs text-rosedust">Something went wrong. Please try again.</p>
      )}

      <div className="flex items-center gap-6 pt-2">
        <button
          onClick={toggleWishlist}
          className="flex items-center gap-2 text-sm hover:text-champagne-dark"
        >
          <Heart size={17} fill={wishlisted ? "#C9A857" : "none"} stroke={wishlisted ? "#C9A857" : "#1C1A17"} />
          {wishlisted ? "In Wishlist" : "Add to Wishlist"}
        </button>
        <button onClick={share} className="flex items-center gap-2 text-sm hover:text-champagne-dark">
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
