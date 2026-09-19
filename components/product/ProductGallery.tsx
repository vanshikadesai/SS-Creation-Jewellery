"use client";

import { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { categoryPlaceholder } from "@/lib/category-placeholder";

export default function ProductGallery({
  images,
  productName,
  categorySlug,
  gender,
}: {
  images: { url: string; altText: string | null }[];
  productName: string;
  categorySlug?: string | null;
  gender?: string | null;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [{ url: "", altText: null }];
  const fallback = categoryPlaceholder(categorySlug, gender);

  return (
    <div>
      <div className="relative aspect-square bg-[#F5F1E8] overflow-hidden mb-4">
        <SafeImage
          src={gallery[active]?.url}
          alt={gallery[active]?.altText ?? productName}
          fallbackSrc={fallback}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square bg-[#F5F1E8] overflow-hidden border ${
                i === active ? "border-champagne" : "border-transparent"
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <SafeImage
                src={img.url}
                alt={img.altText ?? `${productName} ${i + 1}`}
                fallbackSrc={fallback}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
