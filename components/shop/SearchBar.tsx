import { Search } from "lucide-react";

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/shop" method="GET" className="relative w-full max-w-sm">
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search jewellery…"
        className="w-full border border-border bg-transparent pl-4 pr-10 py-2.5 text-sm"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-champagne-dark"
      >
        <Search size={16} />
      </button>
    </form>
  );
}
