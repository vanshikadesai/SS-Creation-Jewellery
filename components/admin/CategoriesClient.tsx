"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import ImageUploader from "./ImageUploader";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
}

interface CollectionItem {
  id: number;
  name: string;
  slug: string;
  categoryId: number | null;
  productCount: number;
}

interface CategoryOption {
  id: number;
  name: string;
}

function CategoriesSection({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit(item: CategoryItem) {
    setEditingId(item.id);
    setAdding(false);
    setName(item.name);
    setSlug(item.slug);
    setImageUrl(item.imageUrl);
    setError("");
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setName("");
    setSlug("");
    setImageUrl(null);
    setError("");
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setError("");
  }

  async function save() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const isEdit = editingId !== null;
      const res = await fetch(`/api/admin/categories${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() || undefined, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      cancel();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item: CategoryItem) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
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

  async function remove(item: CategoryItem) {
    if (item.productCount > 0) {
      alert(`Cannot delete "${item.name}": ${item.productCount} product(s) still use it.`);
      return;
    }
    if (!confirm(`Delete "${item.name}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${item.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-border">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="font-display text-lg">Categories</h2>
        {!adding && editingId === null && (
          <button onClick={startAdd} className="flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-champagne-dark">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {(adding || editingId !== null) && (
        <div className="p-5 border-b border-border bg-[#FAF7F0]">
          <div className="mb-4">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1.5">
              Category Image
            </span>
            <ImageUploader
              images={imageUrl ? [imageUrl] : []}
              onChange={(urls) => setImageUrl(urls[0] ?? null)}
              uploadType="categories"
              max={1}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Name</span>
              <input
                className="border border-border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
                Slug (optional)
              </span>
              <input
                className="border border-border px-3 py-2 text-sm"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from name"
              />
            </label>
            <button onClick={save} disabled={busy} className="btn-primary text-xs px-4 py-2">
              {busy ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel} className="text-charcoal/50 hover:text-charcoal">
              <X size={16} />
            </button>
          </div>
          {error && <p className="text-xs text-rosedust mt-2">{error}</p>}
        </div>
      )}

      <div className="divide-y divide-border">
        {initialCategories.length === 0 ? (
          <p className="p-6 text-sm text-charcoal/50 text-center">No categories yet.</p>
        ) : (
          initialCategories.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 bg-[#F5F1E8] shrink-0 overflow-hidden">
                  <SafeImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-charcoal/50">
                    /{item.slug} · {item.productCount} product{item.productCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => toggleActive(item)}
                  disabled={busy}
                  className={`text-[11px] uppercase tracking-wide2 px-2 py-1 whitespace-nowrap ${
                    item.isActive ? "bg-emerald/10 text-emerald" : "bg-rosedust/10 text-rosedust"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => startEdit(item)} className="text-champagne-dark hover:text-charcoal">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(item)} disabled={busy} className="text-rosedust hover:text-charcoal disabled:opacity-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CollectionsSection({
  initialCollections,
  categoryOptions,
}: {
  initialCollections: CollectionItem[];
  categoryOptions: CategoryOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startEdit(item: CollectionItem) {
    setEditingId(item.id);
    setAdding(false);
    setName(item.name);
    setSlug(item.slug);
    setCategoryId(item.categoryId ?? "");
    setError("");
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setName("");
    setSlug("");
    setCategoryId("");
    setError("");
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setError("");
  }

  async function save() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const isEdit = editingId !== null;
      const res = await fetch(`/api/admin/collections${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          categoryId: categoryId === "" ? null : categoryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      cancel();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: CollectionItem) {
    if (item.productCount > 0) {
      alert(`Cannot delete "${item.name}": ${item.productCount} product(s) still use it.`);
      return;
    }
    if (!confirm(`Delete "${item.name}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/collections/${item.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete.");
      }
    } finally {
      setBusy(false);
    }
  }

  function categoryName(id: number | null) {
    if (id === null) return "All categories (global)";
    return categoryOptions.find((c) => c.id === id)?.name ?? "—";
  }

  return (
    <div className="bg-white border border-border">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h2 className="font-display text-lg">Collections</h2>
          <p className="text-xs text-charcoal/50 mt-0.5">
            Scope a collection to one category (e.g. Halo → Rings) to power that category's
            Collection dropdown in the product form and its "Shop by Style" mega-menu.
          </p>
        </div>
        {!adding && editingId === null && (
          <button onClick={startAdd} className="flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-champagne-dark shrink-0">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {(adding || editingId !== null) && (
        <div className="p-5 border-b border-border bg-[#FAF7F0] flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">Name</span>
            <input
              className="border border-border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
              Slug (optional)
            </span>
            <input
              className="border border-border px-3 py-2 text-sm"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from name"
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wide2 text-charcoal/50 mb-1">
              Category
            </span>
            <select
              className="border border-border px-3 py-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">All categories (global)</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button onClick={save} disabled={busy} className="btn-primary text-xs px-4 py-2">
            {busy ? "Saving…" : "Save"}
          </button>
          <button onClick={cancel} className="text-charcoal/50 hover:text-charcoal">
            <X size={16} />
          </button>
          {error && <p className="text-xs text-rosedust w-full">{error}</p>}
        </div>
      )}

      <div className="divide-y divide-border">
        {initialCollections.length === 0 ? (
          <p className="p-6 text-sm text-charcoal/50 text-center">No collections yet.</p>
        ) : (
          initialCollections.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-charcoal/50">
                  /{item.slug} · {categoryName(item.categoryId)} · {item.productCount} product
                  {item.productCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(item)} className="text-champagne-dark hover:text-charcoal">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(item)} disabled={busy} className="text-rosedust hover:text-charcoal disabled:opacity-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CategoriesClient({
  initialCategories,
  initialCollections,
  categoryOptions,
}: {
  initialCategories: CategoryItem[];
  initialCollections: CollectionItem[];
  categoryOptions: CategoryOption[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <CategoriesSection initialCategories={initialCategories} />
      <CollectionsSection initialCollections={initialCollections} categoryOptions={categoryOptions} />
    </div>
  );
}
