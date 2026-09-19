"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerStatusToggle({
  customerId,
  status,
}: {
  customerId: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (!confirm(`Set this customer's account to ${next}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Failed to update status.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs uppercase tracking-wide2 px-3 py-2 border disabled:opacity-50 ${
        status === "ACTIVE"
          ? "border-rosedust text-rosedust hover:bg-rosedust/10"
          : "border-emerald text-emerald hover:bg-emerald/10"
      }`}
    >
      {busy ? "Updating…" : status === "ACTIVE" ? "Disable Account" : "Activate Account"}
    </button>
  );
}
