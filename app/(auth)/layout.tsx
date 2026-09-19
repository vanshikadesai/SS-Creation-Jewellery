import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";
import FacetMark from "@/components/FacetMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const authUser = getServerAuthUser();
  if (authUser) redirect(authUser.role === "ADMIN" ? "/admin/dashboard" : "/account");

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-10">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow">SS Creation Jewellery</p>
      </div>
      {children}
    </div>
  );
}
