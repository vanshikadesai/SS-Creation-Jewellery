import Link from "next/link";
import { Truck, HelpCircle, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/lib/site-config";

export default function AnnouncementBar() {
  return (
    <div className="bg-navy text-ivory text-[11px] tracking-wide">
      <div className="max-w-content mx-auto px-4 md:px-8 h-9 flex items-center justify-between">
        <p className="flex items-center gap-1.5 truncate">
          <Truck size={13} className="text-champagne shrink-0 hidden sm:inline" />
          <span className="truncate">
            Free Shipping Across India&nbsp;
            <span className="text-ivory/40 mx-1.5 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Certified Diamond Jewellery</span>
            <span className="text-ivory/40 mx-1.5 hidden md:inline">|</span>
            <span className="hidden md:inline">100% Secure Payments</span>
          </span>
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/account/orders" className="hidden sm:flex items-center gap-1 hover:text-champagne transition-colors">
            Track Order
          </Link>
          <Link href="/contact" className="hidden sm:flex items-center gap-1 hover:text-champagne transition-colors">
            <HelpCircle size={13} /> Help
          </Link>
          <a
            href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919930701983"}`}
            className="flex items-center gap-1 hover:text-champagne transition-colors"
          >
            <Phone size={13} /> {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
