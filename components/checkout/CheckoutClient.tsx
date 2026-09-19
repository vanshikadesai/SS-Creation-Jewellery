"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";

export interface CheckoutAddress {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

const EMPTY_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

export default function CheckoutClient({
  initialAddresses,
  summary,
  itemCount,
}: {
  initialAddresses: CheckoutAddress[];
  summary: CheckoutSummary;
  itemCount: number;
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? null
  );
  const [showForm, setShowForm] = useState(initialAddresses.length === 0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save address");
        return;
      }
      setAddresses((prev) => [data.address, ...prev]);
      setSelectedId(data.address.id);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } finally {
      setBusy(false);
    }
  }

  async function placeOrder() {
    if (!selectedId) {
      setError("Please select or add a shipping address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place your order.");
        return;
      }
      router.push(`/checkout/confirmation/${data.order.orderNumber}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <h2 className="font-display text-xl mb-4">Shipping Address</h2>

        {addresses.length > 0 && (
          <div className="space-y-3 mb-6">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex gap-3 border p-4 cursor-pointer ${
                  selectedId === a.id ? "border-champagne bg-[#F5F1E8]" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === a.id}
                  onChange={() => setSelectedId(a.id)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium">
                    {a.fullName} <span className="text-charcoal/40">· {a.label}</span>
                  </p>
                  <p className="text-charcoal/70">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className="text-charcoal/50">Phone: {a.phone}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-outline">
            Add New Address
          </button>
        ) : (
          <form onSubmit={addAddress} className="border border-border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Label (e.g. Home, Office)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="Full Name"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="Phone (10 digits)"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="Pincode (6 digits)"
              required
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="Address Line 1"
              required
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              placeholder="Address Line 2 (optional)"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              placeholder="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="State"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="border border-border bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={busy} className="btn-primary">
                {busy ? "Saving…" : "Save Address"}
              </button>
              {addresses.length > 0 && (
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="border border-border p-6 h-fit space-y-4">
        <h2 className="font-display text-xl mb-2">Order Summary</h2>
        <p className="text-sm text-charcoal/60">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Subtotal</span>
          <span>{formatINR(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-emerald">
            <span>Discount</span>
            <span>-{formatINR(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">GST (3%)</span>
          <span>{formatINR(summary.tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Shipping</span>
          <span>{summary.shipping === 0 ? "Complimentary" : formatINR(summary.shipping)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-border pt-4">
          <span>Total</span>
          <span>{formatINR(summary.total)}</span>
        </div>

        {error && <p className="text-sm text-rosedust">{error}</p>}

        <button onClick={placeOrder} disabled={busy} className="btn-primary w-full">
          {busy ? "Placing Order…" : "Place Order (Demo Payment)"}
        </button>
        <p className="text-xs text-charcoal/40 text-center">
          Payment is processed in demo mode — no real charge is made.
        </p>
      </div>
    </div>
  );
}
