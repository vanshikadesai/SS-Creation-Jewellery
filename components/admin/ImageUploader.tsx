"use client";

import { useRef, useState } from "react";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import SafeImage from "@/components/SafeImage";

export default function ImageUploader({
  images,
  onChange,
  uploadType = "products",
  max = 8,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  uploadType?: "products" | "banners" | "categories";
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files)
        .slice(0, max - images.length)
        .forEach((f) => form.append("file", f));
      form.append("type", uploadType);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange([...images, ...data.urls]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [item] = next.splice(dragIndex, 1);
    next.splice(index, 0, item);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {images.map((url, i) => (
          <div
            key={url + i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="relative aspect-square bg-[#F5F1E8] border border-border group cursor-move"
          >
            <SafeImage src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-charcoal text-ivory text-[9px] uppercase tracking-wide2 px-1.5 py-0.5">
                Primary
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => makePrimary(i)}
                title="Set as primary"
                className="text-ivory p-1 hover:text-champagne"
              >
                <Star size={13} />
              </button>
              <GripVertical size={13} className="text-ivory/50" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                title="Remove"
                className="text-ivory p-1 hover:text-rosedust"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-charcoal/50 hover:border-champagne-dark hover:text-champagne-dark transition-colors disabled:opacity-50"
          >
            <Upload size={18} />
            <span className="text-[11px]">{uploading ? "Uploading…" : "Add Image"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-rosedust mb-1">{error}</p>}
      <p className="text-[11px] text-charcoal/40">
        JPG, PNG, WEBP or GIF, up to 8MB each. Drag to reorder — the first image is the primary photo
        shown on the shop and product pages.
      </p>
    </div>
  );
}
