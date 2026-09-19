"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, formatDate } from "@/lib/format";
import { computeGoldPrice } from "@/lib/gold-pricing";

interface AffectedProduct {
  id: number;
  name: string;
  sku: string;
  goldWeightGrams: number | null;
  goldPurity: string | null;
  price: string;
}

export default function GoldRateClient({
  initialRate,
  lastUpdated,
  lastUpdatedBy,
  affectedProducts,
}: {
  initialRate: number;
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
  affectedProducts: AffectedProduct[];
}) {
  const router = useRouter();
  const [rateInput, setRateInput] = useState(initialRate ? String(initialRate) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ updated: number; skipped: number } | null>(null);

  const newRate = Number(rateInput) || 0;

  async function save() {
    if (!newRate || newRate <= 0) {
      setError("Enter a valid gold rate greater than 0.");
      return;
    }
    if (
      !confirm(
        `Update the 24K gold rate to ₹${newRate.toLocaleString("en-IN")}/g? This recalculates the price of ${affectedProducts.length} product(s) with automatic gold pricing enabled.`
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/gold-rate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratePerGram24k: newRate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update gold rate.");
        return;
      }
      setResult({ updated: data.updated, skipped: data.skipped });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-border p-6">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1.5">
              24K Gold Rate (₹ per gram)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-border px-3 py-2.5 text-sm w-48"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
            />
          </label>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Updating…" : "Update Rate & Recalculate"}
          </button>
        </div>

        {lastUpdated && (
          <p className="text-xs text-charcoal/50 mt-3">
            Last updated {formatDate(lastUpdated)}
            {lastUpdatedBy ? ` by ${lastUpdatedBy}` : ""} — current rate {formatINR(initialRate)}/g.
          </p>
        )}
        {error && <p className="text-sm text-rosedust mt-3">{error}</p>}
        {result && (
          <p className="text-sm text-emerald mt-3">
            Done — {result.updated} product price(s) updated
            {result.skipped > 0
              ? `, ${result.skipped} skipped (missing gold weight/purity)`
              : ""}
            .
          </p>
        )}
      </div>

      <div className="bg-white border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-lg">
            Products with Automatic Gold Pricing ({affectedProducts.length})
          </h2>
          <p className="text-xs text-charcoal/50 mt-1">
            Only these products are affected by the rate above — everything else keeps its manually-set
            price.
          </p>
        </div>
        {affectedProducts.length === 0 ? (
          <p className="p-6 text-sm text-charcoal/50 text-center">
            No products have automatic gold pricing enabled yet. Turn it on from a product's Add/Edit
            form.
          </p>
        ) : (
          <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
            {affectedProducts.map((p) => {
              const preview =
                newRate > 0
                  ? computeGoldPrice({
                      goldWeightGrams: p.goldWeightGrams,
                      goldPurity: p.goldPurity,
                      makingChargeType: "PERCENTAGE",
                      makingChargeValue: 0,
                      otherChargesAmount: 0,
                      ratePerGram24k: newRate,
                    })
                  : null;
              return (
                <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-charcoal/50">
                      {p.sku} · {p.goldWeightGrams ?? "—"}g · {p.goldPurity ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatINR(p.price)}</p>
                    {preview && Number(p.price) !== preview.total && (
                      <p className="text-xs text-champagne-dark">→ ~{formatINR(preview.total)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
