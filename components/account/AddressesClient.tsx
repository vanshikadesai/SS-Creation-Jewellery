"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";

export interface AddressData {
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

export default function AddressesClient({
  initialAddresses,
}: {
  initialAddresses: AddressData[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(a: AddressData) {
    setForm({
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      country: a.country,
      isDefault: a.isDefault,
    });
    setEditingId(a.id);
    setError("");
    setShowForm(true);
  }

  async function refresh() {
    const res = await fetch("/api/addresses");
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.addresses);
      router.refresh();
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        editingId ? `/api/addresses/${editingId}` : "/api/addresses",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setShowForm(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setDefault(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl">Your Addresses</h1>
        {!showForm && (
          <button onClick={openAdd} className="btn-outline">
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="border border-border p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
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
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default address
          </label>

          {error && <p className="text-sm text-rosedust sm:col-span-2">{error}</p>}

          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Saving…" : editingId ? "Save Changes" : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-sm text-charcoal/60 border border-dashed border-border p-6 text-center">
          No saved addresses yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-border p-5 relative">
              {a.isDefault && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] uppercase tracking-wide2 text-champagne-dark">
                  <Star size={12} fill="#C9A857" stroke="#C9A857" /> Default
                </span>
              )}
              <p className="text-xs uppercase tracking-wide2 text-charcoal/50 mb-2">{a.label}</p>
              <p className="font-medium">{a.fullName}</p>
              <p className="text-sm text-charcoal/70">{a.phone}</p>
              <p className="text-sm text-charcoal/70 mt-2">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.country}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <button
                  onClick={() => openEdit(a)}
                  className="flex items-center gap-1 text-charcoal/70 hover:text-champagne-dark"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => remove(a.id)}
                  disabled={busy}
                  className="flex items-center gap-1 text-charcoal/70 hover:text-rosedust"
                >
                  <Trash2 size={14} /> Delete
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    disabled={busy}
                    className="text-champagne-dark hover:underline"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
