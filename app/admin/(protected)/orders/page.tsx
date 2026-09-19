import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/format";

export const metadata = { title: "Orders | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { orderStatus: status as never } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customerName: { contains: q } },
              { customerEmail: { contains: q } },
              { customerMobile: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-6">Orders</h1>

      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search order #, customer, email, mobile…"
          className="flex-1 min-w-[220px] border border-border px-3 py-2.5 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="border border-border px-3 py-2.5 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-outline">
          Filter
        </button>
      </form>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide2 text-charcoal/50">
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-charcoal/50">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF7F0]">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium hover:text-champagne-dark">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-charcoal/50">{o.customerEmail}</p>
                  </td>
                  <td className="p-4 text-charcoal/50 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="p-4">{o.items.length}</td>
                  <td className="p-4 font-medium">{formatINR(o.totalAmount)}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs uppercase tracking-wide2 px-2 py-1 ${
                        o.payment?.status === "PAID"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {o.payment?.status ?? "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs uppercase tracking-wide2 px-2 py-1 bg-[#F5F1E8]">
                      {o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
