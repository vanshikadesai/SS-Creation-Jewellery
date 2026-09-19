import Link from "next/link";
import Image from "next/image";
import AdminLogoutButton from "./AdminLogoutButton";
import AdminMobileNav from "./AdminMobileNav";
import { AuthTokenPayload } from "@/lib/auth";

export default function AdminTopBar({ admin }: { admin: AuthTokenPayload }) {
  return (
    <header className="bg-charcoal text-ivory sticky top-0 z-40">
      <div className="px-4 md:px-8 h-16 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <AdminMobileNav />
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="SS Creation" width={120} height={77} className="h-8 w-auto object-contain" />
            <span className="text-champagne text-sm tracking-wide2 hidden sm:inline">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-ivory/60 hidden sm:inline">{admin.email}</span>
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
