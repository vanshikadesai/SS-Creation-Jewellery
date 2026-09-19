"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Ticket,
  Image as ImageIcon,
  Coins,
} from "lucide-react";

const LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Gold Rate", href: "/admin/gold-rate", icon: Coins },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons / Offers", href: "/admin/coupons", icon: Ticket },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0 bg-charcoal text-ivory min-h-[calc(100vh-4rem)]">
      <nav className="py-6 flex flex-col gap-1">
        {LINKS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-champagne/10 text-champagne border-r-2 border-champagne"
                  : "text-ivory/60 hover:text-ivory hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
