"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";

interface Row {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  categorySlug?: string | null;
  gender?: string | null;
}

export default function InventoryClient({
  rows,
  defaultFilter,
}: {
  rows: Row[];
  defaultFilter: "all" | "low";
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "low" | "out">(defaultFilter);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "low") return rows.filter((r) => r.stockQuantity > 0 && r.stockQuantity <= r.lowStockThreshold);
    if (filter === "out") return rows.filter((r) => r.stockQuantity <= 0);
    return rows;
  }, [rows, filter]);

  async function save(row: Row) {
    const raw = edits[row.id];
    if (raw === undefined) return;
    const value = Number(raw);
    if (Number.isNaN(value) || value < 0) return;

    setSavingId(row.id);
    try {
      const res = await fetch(`/api/products/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: value }),
      });
      if (res.ok) {
        setEdits((e) => {
          const next = { ...e };
          delete next[row.id];
          return next;
        });
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update stock.");
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["all", "low", "out"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs uppercase tracking-wide2 px-4 py-2 border ${
              filter === f ? "bg-charcoal text-ivory border-charcoal" : "border-border text-charcoal/60"
            }`}
          >
            {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide2 text-charcoal/50">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Low Stock Threshold</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-charcoal/50">
                  No products match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const status =
                  row.stockQuantity <= 0 ? "Out of Stock" : row.stockQuantity <= row.lowStockThreshold ? "Low Stock" : "In Stock";
                const statusColor =
                  status === "Out of Stock" ? "text-rosedust" : status === "Low Stock" ? "text-amber-600" : "text-emerald";
                return (
                  <tr key={row.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F5F1E8] shrink-0 overflow-hidden">
                          <SafeImage
                            src={row.image ?? undefined}
                            alt={row.name}
                            fallbackSrc={categoryPlaceholder(row.categorySlug, row.gender)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="font-medium">{row.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-charcoal/70">{row.sku}</td>
                    <td className="p-4">{row.stockQuantity}</td>
                    <td className="p-4 text-charcoal/70">{row.lowStockThreshold}</td>
                    <td className={`p-4 ${statusColor}`}>{status}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder={String(row.stockQuantity)}
                          value={edits[row.id] ?? ""}
                          onChange={(e) => setEdits((s) => ({ ...s, [row.id]: e.target.value }))}
                          className="w-20 border border-border px-2 py-1.5 text-sm"
                        />
                        <button
                          onClick={() => save(row)}
                          disabled={savingId === row.id || edits[row.id] === undefined}
                          className="text-xs uppercase tracking-wide2 text-champagne-dark disabled:opacity-40"
                        >
                          {savingId === row.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
