// Used only as a fallback when a product has no real photo uploaded
// yet (see components/SafeImage.tsx's `fallbackSrc` prop). Each
// category gets its own distinct line-art icon instead of one generic
// diamond glyph for everything, so at least the *shape* on screen
// matches what the product actually is until real photography is
// uploaded via Admin → Products → Edit.
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  rings: "/images/placeholders/rings.svg",
  earrings: "/images/placeholders/earrings.svg",
  necklaces: "/images/placeholders/necklaces.svg",
  bracelets: "/images/placeholders/bracelets.svg",
  bangles: "/images/placeholders/bangles.svg",
  pendants: "/images/placeholders/pendants.svg",
  chains: "/images/placeholders/chains.svg",
};

export function categoryPlaceholder(categorySlug?: string | null, gender?: string | null): string {
  if (gender === "MEN") return "/images/placeholders/mens.svg";
  if (categorySlug && CATEGORY_PLACEHOLDERS[categorySlug]) {
    return CATEGORY_PLACEHOLDERS[categorySlug];
  }
  return "/images/placeholder.svg";
}
