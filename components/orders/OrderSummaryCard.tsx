import { formatINR, formatDate, toNumber } from "@/lib/format";

export interface OrderDetailData {
  orderNumber: string;
  createdAt: Date | string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddressSnapshot: string;
  subtotal: unknown;
  discountAmount: unknown;
  taxAmount: unknown;
  shippingAmount: unknown;
  totalAmount: unknown;
  items: {
    id: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: unknown;
    lineTotal: unknown;
  }[];
  payment: { method: string; status: string; transactionRef: string | null } | null;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export default function OrderSummaryCard({ order }: { order: OrderDetailData }) {
  return (
    <div className="border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-6 border-b border-border bg-[#F5F1E8]">
        <div>
          <p className="text-xs text-charcoal/50">Order Number</p>
          <p className="font-display text-xl">{order.orderNumber}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-charcoal/50">Placed On</p>
          <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide2 border border-champagne text-champagne-dark px-3 py-1.5 w-fit">
          {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <p className="eyebrow mb-2">Shipping To</p>
          <p className="text-sm whitespace-pre-line leading-relaxed">
            {order.shippingAddressSnapshot}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-2">Contact</p>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-charcoal/60">{order.customerEmail}</p>
          <p className="text-sm text-charcoal/60">{order.customerMobile}</p>
          {order.payment && (
            <p className="text-xs text-charcoal/50 mt-3">
              Payment: {order.payment.method} · {order.payment.status}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border divide-y divide-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-5 text-sm">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-xs text-charcoal/50">
                SKU {item.productSku} · Qty {item.quantity}
              </p>
            </div>
            <p className="font-semibold">{formatINR(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-6 space-y-2 max-w-xs ml-auto text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal/60">Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        {toNumber(order.discountAmount) > 0 && (
          <div className="flex justify-between text-emerald">
            <span>Discount</span>
            <span>-{formatINR(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-charcoal/60">GST (3%)</span>
          <span>{formatINR(order.taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal/60">Shipping</span>
          <span>
            {toNumber(order.shippingAmount) === 0 ? "Complimentary" : formatINR(order.shippingAmount)}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t border-border pt-3">
          <span>Total</span>
          <span>{formatINR(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
