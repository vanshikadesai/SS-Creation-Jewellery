import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Auth gate for every /admin/* page EXCEPT /admin/login, which lives
// outside this (protected) route group specifically so it stays
// reachable by a logged-out admin. Every current and future page placed
// under app/admin/(protected)/* automatically inherits this check —
// there's no per-page opt-in to forget.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = getServerAuthUser();

  // Not logged in at all → the dedicated admin login page, which brings
  // them straight back here (?redirect=...) after a successful sign-in.
  if (!authUser) redirect("/admin/login");

  // Logged in, but as a customer → this is the actual enforcement point.
  // A regular customer is never shown admin markup or handed admin data;
  // they're bounced to their own account area instead.
  if (authUser.role !== "ADMIN") redirect("/account");

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <AdminTopBar admin={authUser} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-4 md:px-8 py-10">{children}</main>
      </div>
    </div>
  );
}

