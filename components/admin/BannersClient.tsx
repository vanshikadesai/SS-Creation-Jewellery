"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import ImageUploader from "@/components/admin/ImageUploader";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  displayOrder: "0",
  isActive: true,
};

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
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

  function openEdit(b: Banner) {
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      displayOrder: String(b.displayOrder),
      isActive: b.isActive,
    });
    setEditingId(b.id);
    setShowForm(true);
    setError("");
  }

  async function save() {
    if (!form.title.trim() || !form.imageUrl) {
      setError("Title and an image are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl.trim() || null,
        displayOrder: Number(form.displayOrder || 0),
        isActive: form.isActive,
      };
      const res = await fetch(`/api/admin/banners${editingId ? `/${editingId}` : ""}`, {
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

  async function toggleActive(b: Banner) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(b: Banner) {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
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
            <Plus size={16} /> Add Banner
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">{editingId ? "Edit Banner" : "New Banner"}</h2>
            <button onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>
          {error && <p className="text-sm text-rosedust mb-3">{error}</p>}

          <div className="mb-4">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1.5">
              Banner Image
            </span>
            <ImageUploader
              images={form.imageUrl ? [form.imageUrl] : []}
              onChange={(urls) => setForm((f) => ({ ...f, imageUrl: urls[0] ?? "" }))}
              uploadType="banners"
              max={1}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Title</span>
              <input
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Subtitle</span>
              <input
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Link URL (optional)
              </span>
              <input
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop?category=rings"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Display Order
              </span>
              <input
                type="number"
                className="w-full border border-border px-3 py-2 text-sm"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button onClick={save} disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? "Saving…" : "Save Banner"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-charcoal/60">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialBanners.length === 0 ? (
          <p className="text-sm text-charcoal/50 col-span-full text-center py-10">
            No banners yet — add one to feature it on the homepage.
          </p>
        ) : (
          initialBanners.map((b) => (
            <div key={b.id} className="bg-white border border-border">
              <div className="aspect-[16/9] bg-[#F5F1E8] overflow-hidden">
                <SafeImage src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-medium text-sm">{b.title}</p>
                {b.subtitle && <p className="text-xs text-charcoal/50">{b.subtitle}</p>}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => toggleActive(b)}
                    disabled={busy}
                    className={`text-[11px] uppercase tracking-wide2 px-2 py-1 ${
                      b.isActive ? "bg-emerald/10 text-emerald" : "bg-rosedust/10 text-rosedust"
                    }`}
                  >
                    {b.isActive ? "Active" : "Disabled"}
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(b)} className="text-champagne-dark hover:text-charcoal">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(b)} className="text-rosedust hover:text-charcoal">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
