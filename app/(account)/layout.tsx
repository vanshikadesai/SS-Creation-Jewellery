import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";
import AccountNav from "@/components/account/AccountNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const authUser = getServerAuthUser();
  if (!authUser) redirect("/login?redirect=/account");

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
