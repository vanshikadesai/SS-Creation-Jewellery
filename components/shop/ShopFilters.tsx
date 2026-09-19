"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export interface FilterOptions {
  categories: { name: string; slug: string }[];
  collections: { name: string; slug: string }[];
  materials: string[];
  goldPurities: string[];
  occasions: string[];
}

export default function ShopFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleBool(key: string) {
    updateParam(key, searchParams.get(key) === "true" ? null : "true");
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "sort" && k !== "q");

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs uppercase tracking-wide2 text-champagne-dark hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="eyebrow mb-3">Category</p>
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value || null)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {options.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {options.collections.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Collection</p>
          <select
            value={searchParams.get("collection") ?? ""}
            onChange={(e) => updateParam("collection", e.target.value || null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">All Collections</option>
            {options.collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="eyebrow mb-3">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          />
          <span className="text-charcoal/40">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={applyPriceRange}
          className="mt-3 w-full border border-charcoal text-xs uppercase tracking-wide2 py-2 hover:bg-charcoal hover:text-ivory transition-colors"
        >
          Apply
        </button>
      </div>

      {options.materials.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Material</p>
          <select
            value={searchParams.get("material") ?? ""}
            onChange={(e) => updateParam("material", e.target.value || null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Any Material</option>
            {options.materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {options.goldPurities.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Gold Purity</p>
          <select
            value={searchParams.get("goldPurity") ?? ""}
            onChange={(e) => updateParam("goldPurity", e.target.value || null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Any Purity</option>
            {options.goldPurities.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {options.occasions.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Occasion</p>
          <select
            value={searchParams.get("occasion") ?? ""}
            onChange={(e) => updateParam("occasion", e.target.value || null)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Any Occasion</option>
            {options.occasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="eyebrow mb-3">Highlights</p>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.get("featured") === "true"}
              onChange={() => toggleBool("featured")}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.get("newArrival") === "true"}
              onChange={() => toggleBool("newArrival")}
            />
            New Arrivals
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.get("bestSeller") === "true"}
              onChange={() => toggleBool("bestSeller")}
            />
            Best Sellers
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.get("inStock") === "true"}
              onChange={() => toggleBool("inStock")}
            />
            In Stock Only
          </label>
        </div>
      </div>
    </aside>
  );
}
