import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { ok } from "@/lib/api-utils";

export async function POST() {
  const res = ok({ success: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
