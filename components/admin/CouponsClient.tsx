"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { formatDate } from "@/lib/format";

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FLAT";
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
  discountValue: "",
  minOrderValue: "0",
  maxDiscountAmount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      description: c.description ?? "",
      type: c.type,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscountAmount: c.maxDiscountAmount ?? "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  }

  async function save() {
    if (!form.code.trim() || !form.discountValue) {
      setError("Coupon code and discount value are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim(),
        description: form.description.trim() || null,
        type: form.type,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };
      const res = await fetch(`/api/admin/coupons${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setShowForm(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(c: Coupon) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showForm && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
            <button onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>
          {error && <p className="text-sm text-rosedust mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Code</span>
              <input
                className="w-full border border-border px-3 py-2 text-sm uppercase"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="WELCOME10"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Type</span>
              <select
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENTAGE" | "FLAT" }))}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Discount Value
              </span>
              <input
                type="number"
                min="0"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Minimum Order Value (₹)
              </span>
              <input
                type="number"
                min="0"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Max Discount Amount (₹, optional)
              </span>
              <input
                type="number"
                min="0"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Usage Limit (optional)
              </span>
              <input
                type="number"
                min="0"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Expiry Date (optional)
              </span>
              <input
                type="date"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Description (optional)
              </span>
              <input
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button onClick={save} disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? "Saving…" : "Save Coupon"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-charcoal/60">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide2 text-charcoal/50">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Usage</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-charcoal/50">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              initialCoupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-medium">{c.code}</td>
                  <td className="p-4">
                    {c.type === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="p-4 text-charcoal/70">₹{c.minOrderValue}</td>
                  <td className="p-4 text-charcoal/70">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="p-4 text-charcoal/70 text-xs">
                    {c.expiresAt ? formatDate(c.expiresAt) : "No expiry"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={busy}
                      className={`text-xs uppercase tracking-wide2 px-2 py-1 ${
                        c.isActive ? "bg-emerald/10 text-emerald" : "bg-rosedust/10 text-rosedust"
                      }`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(c)} className="text-champagne-dark hover:text-charcoal">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(c)} className="text-rosedust hover:text-charcoal">
                        <Trash2 size={15} />
                      </button>
                    </div>
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
