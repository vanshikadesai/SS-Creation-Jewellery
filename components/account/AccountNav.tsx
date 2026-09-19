"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Dashboard", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/account/wishlist" },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2.5 text-sm border-l-2 ${
              active
                ? "border-champagne text-charcoal font-medium bg-[#F5F1E8]"
                : "border-transparent text-charcoal/60 hover:text-charcoal hover:border-border"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
