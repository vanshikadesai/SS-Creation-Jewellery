// The brand's signature element: a single line-drawing of a gem's table
// and crown facets, rendered thin and gold. Used sparingly as a section
// marker in place of generic numbered badges or gradient blobs — it's
// the one recognizable "SS Creation" visual signature across the site.
export default function FacetMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={className}
      fill="none"
      stroke="#C9A857"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M12 8 L32 2 L52 8 L44 8 L32 2 L20 8 Z" />
      <path d="M12 8 L4 20 L20 38 L44 38 L60 20 L52 8" />
      <path d="M20 8 L12 20 L20 38" />
      <path d="M44 8 L52 20 L44 38" />
      <path d="M20 8 L32 20 L44 8" />
      <path d="M12 20 L52 20" />
      <path d="M20 38 L32 20 L44 38" />
    </svg>
  );
}
