"use client";

import { useState } from "react";
import Link from "next/link";
import { WHATSAPP_DISPLAY } from "@/lib/site-config";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-charcoal text-ivory mt-24">
      <div className="max-w-content mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-2xl mb-3">SS CREATION JEWELLERY</h3>
          <p className="text-sm text-ivory/70 leading-relaxed">
            1108, Kosha Complex, Malad East, Mumbai - 400097
            <br />
            {WHATSAPP_DISPLAY}
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-champagne mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/shop?category=rings" className="hover:text-champagne transition-colors">Rings</Link></li>
            <li><Link href="/shop?category=necklaces" className="hover:text-champagne transition-colors">Necklaces</Link></li>
            <li><Link href="/shop?category=earrings" className="hover:text-champagne transition-colors">Earrings</Link></li>
            <li><Link href="/shop?category=bangles" className="hover:text-champagne transition-colors">Bangles</Link></li>
            <li><Link href="/shop?collection=bridal-collection" className="hover:text-champagne transition-colors">Bridal Collection</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-champagne mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/account/orders" className="hover:text-champagne transition-colors">Track Order</Link></li>
            <li>Returns & Exchanges</li>
            <li>Care Instructions</li>
            <li>Certification</li>
            <li><Link href="/contact" className="hover:text-champagne transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-champagne mb-4">Stay in the light</h4>
          <p className="text-sm text-ivory/70 mb-4">
            New collections and private previews, occasionally.
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent border border-ivory/30 px-3 py-2 text-sm placeholder:text-ivory/40"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="border border-champagne text-champagne px-4 text-sm uppercase tracking-wide2 hover:bg-champagne hover:text-charcoal transition-colors"
            >
              Join
            </button>
          </form>
          {status === "done" && (
            <p className="text-xs text-champagne mt-2">Subscribed. Welcome.</p>
          )}
          {status === "error" && (
            <p className="text-xs text-rosedust mt-2">Couldn&apos;t subscribe — try again.</p>
          )}
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} SS Creation Jewellery. All rights reserved.
      </div>
    </footer>
  );
}
