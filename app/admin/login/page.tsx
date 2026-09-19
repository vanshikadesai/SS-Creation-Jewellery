import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin Sign In | SS Creation Jewellery" };

export default function AdminLoginPage() {
  const authUser = getServerAuthUser();
  if (authUser?.role === "ADMIN") redirect("/admin/dashboard");

  return <AdminLoginForm />;
}
