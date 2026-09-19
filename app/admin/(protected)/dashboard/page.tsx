import Link from "next/link";
import { getDashboardStats } from "@/lib/products";
import { formatINR, formatDate } from "@/lib/format";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const topStats = [
    { label: "Total Customers", value: stats.totalCustomers, icon: Users },
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
    { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: IndianRupee },
  ];

  const orderStats = [
    { label: "Pending", value: stats.pendingOrders, icon: Clock, color: "text-amber-600" },
    { label: "Confirmed", value: stats.confirmedOrders, icon: CheckCircle2, color: "text-blue-600" },
    { label: "Delivered", value: stats.deliveredOrders, icon: Truck, color: "text-emerald" },
    { label: "Cancelled", value: stats.cancelledOrders, icon: XCircle, color: "text-rosedust" },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {topStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-border p-6 flex items-center gap-4">
            <div className="bg-[#F5F1E8] p-3">
              <Icon size={20} className="text-champagne-dark" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-charcoal/50 uppercase tracking-wide2">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {orderStats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border p-5 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-[11px] text-charcoal/50 uppercase tracking-wide2">{label} Orders</p>
            </div>
          </div>
        ))}
      </div>

      {stats.lowStockCount > 0 && (
        <Link
          href="/admin/inventory?filter=low"
          className="flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 px-5 py-3 mb-8 text-sm hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle size={17} />
          {stats.lowStockCount} product{stats.lowStockCount === 1 ? "" : "s"} at or below its low-stock
          threshold — review inventory.
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-wide2 text-champagne-dark">
              View All
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-charcoal/60 p-6 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((o) => (
                <Link
                  href={`/admin/orders/${o.orderNumber}`}
                  key={o.id}
                  className="flex items-center justify-between p-5 text-sm hover:bg-[#FAF7F0] transition-colors"
                >
                  <div>
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-charcoal/50">
                      {o.customerName} · {formatDate(o.createdAt)} · {o.items.length} item
                      {o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(o.totalAmount)}</p>
                    <p className="text-xs text-champagne-dark">{o.orderStatus}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-xl">Recent Customers</h2>
            <Link href="/admin/customers" className="text-xs uppercase tracking-wide2 text-champagne-dark">
              View All
            </Link>
          </div>
          {stats.recentCustomers.length === 0 ? (
            <p className="text-sm text-charcoal/60 p-6 text-center">No customers yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentCustomers.map((c) => (
                <Link
                  href={`/admin/customers/${c.id}`}
                  key={c.id}
                  className="flex items-center justify-between p-5 text-sm hover:bg-[#FAF7F0] transition-colors"
                >
                  <div>
                    <p className="font-medium">{c.fullName}</p>
                    <p className="text-xs text-charcoal/50">{c.email}</p>
                  </div>
                  <p className="text-xs text-charcoal/50">{formatDate(c.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl">Recent Products</h2>
          <Link href="/admin/products" className="text-xs uppercase tracking-wide2 text-champagne-dark">
            View All
          </Link>
        </div>
        {stats.recentProducts.length === 0 ? (
          <p className="text-sm text-charcoal/60 p-6 text-center">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-border">
            {stats.recentProducts.map((p) => (
              <Link
                href={`/admin/products/${p.id}/edit`}
                key={p.id}
                className="bg-white p-4 hover:bg-[#FAF7F0] transition-colors"
              >
                <div className="aspect-square bg-[#F5F1E8] mb-2 overflow-hidden">
                  <SafeImage
                    src={p.images[0]?.url}
                    alt={p.name}
                    fallbackSrc={categoryPlaceholder(p.category.slug, p.gender)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-charcoal/50">{p.category.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
