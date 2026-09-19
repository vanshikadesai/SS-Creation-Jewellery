import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { queryAdminProducts } from "@/lib/products";

// GET /api/admin/products — admin only. Unlike the public
// /api/products (which always filters status: "ACTIVE" for the
// storefront), this returns products of every status so the admin
// table can show drafts and archived items too.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const sp = req.nextUrl.searchParams;
    const result = await queryAdminProducts({
      q: sp.get("q"),
      category: sp.get("category"),
      collection: sp.get("collection"),
      status: sp.get("status"),
      stock: sp.get("stock"),
      sort: sp.get("sort"),
      page: sp.get("page"),
      pageSize: sp.get("pageSize"),
    });
    return ok(result);
  } catch (err) {
    return apiError(err);
  }
}
