import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { queryAdminProducts } from "@/lib/products";
import { formatINR, formatDate } from "@/lib/format";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { Plus } from "lucide-react";

export const metadata = { title: "Products | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const [{ items, pagination }, categories] = await Promise.all([
    queryAdminProducts({
      q: searchParams.q,
      category: searchParams.category,
      status: searchParams.status,
      stock: searchParams.stock,
      sort: searchParams.sort,
      page: searchParams.page,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  function hrefFor(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...patch, page: patch.page ?? undefined };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 mb-6 bg-white border border-border p-4" method="get">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search name, SKU, category…"
          className="flex-1 min-w-[200px] border border-border px-3 py-2 text-sm"
        />
        <select name="category" defaultValue={searchParams.category ?? ""} className="border border-border px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ""} className="border border-border px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="stock" defaultValue={searchParams.stock ?? ""} className="border border-border px-3 py-2 text-sm">
          <option value="">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button type="submit" className="btn-outline">
          Filter
        </button>
      </form>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide2 text-charcoal/50">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-charcoal/50">
                  No products found.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7F0]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F5F1E8] shrink-0 overflow-hidden">
                        <SafeImage
                          src={p.images[0]?.url}
                          alt={p.name}
                          fallbackSrc={categoryPlaceholder(p.category.slug, p.gender)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-charcoal/50">{p.collection?.name ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-charcoal/70">{p.sku}</td>
                  <td className="p-4 text-charcoal/70">{p.category.name}</td>
                  <td className="p-4">
                    <p>{formatINR(p.price)}</p>
                    {p.discountPercent > 0 && (
                      <p className="text-xs text-charcoal/40 line-through">{formatINR(p.originalPrice)}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        p.stockQuantity <= 0
                          ? "text-rosedust"
                          : p.stockQuantity <= p.lowStockThreshold
                          ? "text-amber-600"
                          : "text-charcoal"
                      }
                    >
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs uppercase tracking-wide2 px-2 py-1 bg-[#F5F1E8]">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal/50 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="p-4">
                    <ProductRowActions productId={p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 text-sm">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <Link
              key={i}
              href={hrefFor({ page: String(i + 1) })}
              className={`w-9 h-9 flex items-center justify-center border ${
                pagination.page === i + 1
                  ? "bg-charcoal text-ivory border-charcoal"
                  : "border-border hover:border-champagne-dark"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
