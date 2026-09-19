"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function OrderStatusUpdater({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [busy, setBusy] = useState(false);

  async function update(patch: { orderStatus?: string; paymentStatus?: string }) {
    if (patch.orderStatus === "CANCELLED" && orderStatus !== "CANCELLED") {
      if (!confirm("Cancel this order? Stock for all its items will be restored automatically.")) {
        return;
      }
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to update order.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide2 text-charcoal/50">Order Status</span>
        <select
          value={status}
          disabled={busy}
          onChange={(e) => {
            setStatus(e.target.value);
            update({ orderStatus: e.target.value });
          }}
          className="border border-border px-3 py-2 text-sm"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide2 text-charcoal/50">Payment</span>
        <select
          value={payment}
          disabled={busy}
          onChange={(e) => {
            setPayment(e.target.value);
            update({ paymentStatus: e.target.value });
          }}
          className="border border-border px-3 py-2 text-sm"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
