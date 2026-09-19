import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function hrefFor(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

export default function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  // Keep the page list short: current +/- 2, always show first/last.
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-14 text-sm"
    >
      <Link
        href={hrefFor(searchParams, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`p-2 border border-border ${
          page === 1 ? "pointer-events-none opacity-30" : "hover:border-champagne-dark"
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {sorted.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && sorted[i - 1] !== p - 1 && <span className="text-charcoal/30">…</span>}
          <Link
            href={hrefFor(searchParams, p)}
            className={`w-9 h-9 flex items-center justify-center border ${
              p === page
                ? "bg-charcoal text-ivory border-charcoal"
                : "border-border hover:border-champagne-dark"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={hrefFor(searchParams, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`p-2 border border-border ${
          page === totalPages ? "pointer-events-none opacity-30" : "hover:border-champagne-dark"
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
