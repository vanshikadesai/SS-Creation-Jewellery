import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/format";
import CustomerStatusToggle from "@/components/admin/CustomerStatusToggle";

export const metadata = { title: "Customer Detail | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.user.findFirst({
    where: { id: Number(params.id), role: { name: "CUSTOMER" } },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true, payment: true },
      },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((s, o) => s + Number(o.totalAmount), 0);

  return (
    <div>
      <Link href="/admin/customers" className="text-xs text-charcoal/50 hover:text-charcoal mb-4 inline-block">
        ← Back to Customers
      </Link>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl">{customer.fullName}</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {customer.email} · {customer.mobile}
          </p>
        </div>
        <CustomerStatusToggle customerId={customer.id} status={customer.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-border p-5">
          <p className="text-2xl font-semibold">{customer.orders.length}</p>
          <p className="text-xs text-charcoal/50 uppercase tracking-wide2">Orders</p>
        </div>
        <div className="bg-white border border-border p-5">
          <p className="text-2xl font-semibold">{formatINR(totalSpent)}</p>
          <p className="text-xs text-charcoal/50 uppercase tracking-wide2">Total Spent</p>
        </div>
        <div className="bg-white border border-border p-5">
          <p className="text-2xl font-semibold">{formatDate(customer.createdAt)}</p>
          <p className="text-xs text-charcoal/50 uppercase tracking-wide2">Registered</p>
        </div>
        <div className="bg-white border border-border p-5">
          <p className="text-2xl font-semibold">{customer.addresses.length}</p>
          <p className="text-xs text-charcoal/50 uppercase tracking-wide2">Saved Addresses</p>
        </div>
      </div>

      <div className="bg-white border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-xl">Order History</h2>
        </div>
        {customer.orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-charcoal/50">No orders yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {customer.orders.map((o) => (
              <Link
                href={`/admin/orders/${o.orderNumber}`}
                key={o.id}
                className="block p-5 hover:bg-[#FAF7F0] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{o.orderNumber}</p>
                  <p className="text-xs text-charcoal/50">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-charcoal/60">
                    {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                    {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                  </p>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold">{formatINR(o.totalAmount)}</p>
                    <p className="text-xs text-champagne-dark">
                      {o.orderStatus} · {o.payment?.status ?? "—"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
