import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthUser } from "@/lib/auth";
import { formatINR, formatDate } from "@/lib/format";

export const metadata = { title: "Your Orders | SS Creation Jewellery" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export default async function OrdersPage() {
  const authUser = getServerAuthUser()!;
  const orders = await prisma.order.findMany({
    where: { userId: authUser.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border">
          <p className="font-display text-xl mb-2">No orders yet.</p>
          <p className="text-charcoal/60 text-sm mb-6">
            When you place an order, it will show up here.
          </p>
          <Link href="/shop" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.orderNumber}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 hover:bg-[#F5F1E8] transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{o.orderNumber}</p>
                <p className="text-xs text-charcoal/50">
                  {formatDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </p>
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
  );
}
