"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductRowActions({ productId }: { productId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this product? If it has past orders it will be archived instead of deleted.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete product.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/admin/products/${productId}/edit`} className="text-champagne-dark hover:text-charcoal" title="Edit">
        <Pencil size={16} />
      </Link>
      <button onClick={handleDelete} disabled={busy} className="text-rosedust hover:text-charcoal disabled:opacity-50" title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
