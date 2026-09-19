"use client";

import { useState } from "react";

export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/images/placeholder.svg",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  /** Category-specific fallback (see lib/category-placeholder.ts) — falls back to the generic gem glyph if not given. */
  fallbackSrc?: string;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? fallbackSrc : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
