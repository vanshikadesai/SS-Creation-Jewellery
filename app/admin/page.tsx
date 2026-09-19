import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth";

export default function AdminRootPage() {
  const authUser = getServerAuthUser();
  if (!authUser) redirect("/admin/login");
  if (authUser.role !== "ADMIN") redirect("/account");
  redirect("/admin/dashboard");
}
