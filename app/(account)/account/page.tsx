import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import { formatINR, formatDate } from "@/lib/format";
import LogoutButton from "@/components/account/LogoutButton";
import { Heart, ShoppingBag, MapPin } from "lucide-react";

export const metadata = { title: "My Account | SS Creation Jewellery" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export default async function AccountDashboard() {
  const authUser = getServerAuthUser()!;

  const [user, recentOrders, wishlistCount, cartCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: authUser.userId } }),
    prisma.order.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.wishlistItem.count({ where: { wishlist: { userId: authUser.userId } } }),
    prisma.cartItem.count({ where: { cart: { userId: authUser.userId } } }),
  ]);

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl mb-1">Welcome, {user.fullName.split(" ")[0]}</h1>
          <p className="text-sm text-charcoal/60">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-6">
          <p className="text-xs text-charcoal/50 mb-1">Full Name</p>
          <p className="font-medium">{user.fullName}</p>
        </div>
        <div className="border border-border p-6">
          <p className="text-xs text-charcoal/50 mb-1">Email</p>
          <p className="font-medium truncate">{user.email}</p>
        </div>
        <div className="border border-border p-6">
          <p className="text-xs text-charcoal/50 mb-1">Mobile</p>
          <p className="font-medium">{user.mobile}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/cart"
          className="flex items-center gap-3 border border-border p-6 hover:border-champagne-dark transition-colors"
        >
          <ShoppingBag size={20} className="text-champagne-dark" />
          <div>
            <p className="font-medium">Cart</p>
            <p className="text-xs text-charcoal/50">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
          </div>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 border border-border p-6 hover:border-champagne-dark transition-colors"
        >
          <Heart size={20} className="text-champagne-dark" />
          <div>
            <p className="font-medium">Wishlist</p>
            <p className="text-xs text-charcoal/50">{wishlistCount} item{wishlistCount === 1 ? "" : "s"}</p>
          </div>
        </Link>
        <Link
          href="/account/addresses"
          className="flex items-center gap-3 border border-border p-6 hover:border-champagne-dark transition-colors"
        >
          <MapPin size={20} className="text-champagne-dark" />
          <div>
            <p className="font-medium">Addresses</p>
            <p className="text-xs text-charcoal/50">Manage shipping addresses</p>
          </div>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs uppercase tracking-wide2 text-champagne-dark hover:underline">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-charcoal/60 border border-dashed border-border p-6 text-center">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.orderNumber}`}
                className="flex items-center justify-between p-5 hover:bg-[#F5F1E8] transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{o.orderNumber}</p>
                  <p className="text-xs text-charcoal/50">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatINR(o.totalAmount)}</p>
                  <p className="text-xs text-champagne-dark">
                    {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
