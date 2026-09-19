import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/format";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export const metadata = { title: "Order Detail | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

async function findOrder(idOrNumber: string) {
  const numeric = Number(idOrNumber);
  return prisma.order.findFirst({
    where: !Number.isNaN(numeric)
      ? { OR: [{ id: numeric }, { orderNumber: idOrNumber }] }
      : { orderNumber: idOrNumber },
    include: {
      items: { include: { product: { include: { images: { take: 1 }, category: { select: { slug: true } } } } } },
      payment: true,
      address: true,
      user: { select: { id: true, fullName: true, email: true, mobile: true } },
    },
  });
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await findOrder(params.id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-charcoal/50 hover:text-charcoal mb-4 inline-block">
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl">{order.orderNumber}</h1>
          <p className="text-sm text-charcoal/60 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusUpdater
          orderId={order.orderNumber}
          orderStatus={order.orderStatus}
          paymentStatus={order.payment?.status ?? "PENDING"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-border p-5">
          <h2 className="text-xs uppercase tracking-wide2 text-charcoal/50 mb-3">Customer Information</h2>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-charcoal/70">{order.customerEmail}</p>
          <p className="text-sm text-charcoal/70">{order.customerMobile}</p>
          {order.user && (
            <Link href={`/admin/customers/${order.user.id}`} className="text-xs text-champagne-dark mt-2 inline-block">
              View customer profile →
            </Link>
          )}
        </div>

        <div className="bg-white border border-border p-5">
          <h2 className="text-xs uppercase tracking-wide2 text-charcoal/50 mb-3">Shipping Information</h2>
          {order.address ? (
            <>
              <p className="text-sm">{order.address.fullName}</p>
              <p className="text-sm text-charcoal/70">{order.address.line1}</p>
              {order.address.line2 && <p className="text-sm text-charcoal/70">{order.address.line2}</p>}
              <p className="text-sm text-charcoal/70">
                {order.address.city}, {order.address.state} {order.address.pincode}
              </p>
              <p className="text-sm text-charcoal/70">{order.address.phone}</p>
            </>
          ) : (
            <p className="text-sm text-charcoal/50">No shipping address on file.</p>
          )}
        </div>

        <div className="bg-white border border-border p-5">
          <h2 className="text-xs uppercase tracking-wide2 text-charcoal/50 mb-3">Payment</h2>
          <p className="text-sm">
            Method: <span className="font-medium">{order.payment?.method ?? "—"}</span>
          </p>
          <p className="text-sm">
            Status: <span className="font-medium">{order.payment?.status ?? "—"}</span>
          </p>
          <p className="text-sm mt-2">
            Total: <span className="font-semibold text-base">{formatINR(order.totalAmount)}</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-xl">Order Items</h2>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-5">
              <div className="w-16 h-16 bg-[#F5F1E8] shrink-0 overflow-hidden">
                <SafeImage
                  src={item.product?.images[0]?.url}
                  alt={item.productName}
                  fallbackSrc={categoryPlaceholder(item.product?.category?.slug, item.product?.gender)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-xs text-charcoal/50">SKU: {item.productSku}</p>
              </div>
              <p className="text-sm text-charcoal/70 w-16 text-center">×{item.quantity}</p>
              <p className="text-sm text-charcoal/70 w-24 text-right">{formatINR(item.unitPrice)}</p>
              <p className="text-sm font-medium w-28 text-right">{formatINR(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end p-5 border-t border-border">
          <p className="text-lg font-semibold">Total: {formatINR(order.totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
