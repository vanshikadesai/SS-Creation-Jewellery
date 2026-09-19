"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("sort") ?? "featured"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="border border-border bg-transparent px-3 py-2 text-sm"
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          Sort: {o.label}
        </option>
      ))}
    </select>
  );
}
