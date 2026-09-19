"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Gold Rate", href: "/admin/gold-rate" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Coupons / Offers", href: "/admin/coupons" },
  { label: "Banners", href: "/admin/banners" },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button aria-label="Open admin menu" onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-charcoal/60" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-charcoal text-ivory p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="mb-6">
              <X size={20} />
            </button>
            <nav className="flex flex-col gap-4">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
