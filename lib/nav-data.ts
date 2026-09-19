// Config for the navbar's category hover mega-menus. Every link below
// resolves through the *existing* /shop query-param filtering
// (buildProductWhere in lib/products.ts) — nothing here is a second,
// independent filter system.
//
// A note on scope: two items from the original spec were intentionally
// left out because the product schema has no matching attribute and
// nothing in the catalog could actually satisfy them:
//   - "Wear position" (Thumb/Finger/Toe) for rings
//   - Structured "size" filtering (no `size` field exists on Product)
// Adding UI for filters that can't return real results would just show
// customers an empty page, so those were dropped rather than faked.
// Style keywords (Hoops, Choker, Signet, etc.) route through the
// existing text-search `q` param instead of a new field, since that's
// already how buildProductWhere matches free-text against product
// names.

export interface CategoryMenuConfig {
  slug: string;
  label: string;
  styleLabel: string;
  styles: string[];
  occasions: string[];
}

export const CATEGORY_MENUS: CategoryMenuConfig[] = [
  {
    slug: "rings",
    label: "Rings",
    styleLabel: "Shop by Style",
    styles: ["Solitaire", "Halo", "Band", "Cocktail"],
    occasions: ["Engagement", "Wedding", "Anniversary", "Birthday", "Everyday"],
  },
  {
    slug: "necklaces",
    label: "Necklaces",
    styleLabel: "Shop by Style",
    styles: ["Pendant Necklace", "Choker", "Chain Necklace"],
    occasions: ["Wedding", "Party", "Everyday"],
  },
  {
    slug: "earrings",
    label: "Earrings",
    styleLabel: "Shop by Style",
    styles: ["Studs", "Hoops", "Drops", "Jhumkas"],
    occasions: ["Party", "Wedding", "Everyday"],
  },
  {
    slug: "bracelets",
    label: "Bracelets",
    styleLabel: "Shop by Style",
    styles: ["Chain Bracelet", "Diamond Bracelet", "Gold Bracelet"],
    occasions: ["Wedding", "Party", "Everyday"],
  },
  {
    slug: "bangles",
    label: "Bangles",
    styleLabel: "Shop by Style",
    styles: ["Gold", "Diamond", "Daily Wear"],
    occasions: ["Wedding", "Party"],
  },
  {
    slug: "pendants",
    label: "Pendants",
    styleLabel: "Shop by Style",
    styles: ["Diamond", "Gold", "Solitaire"],
    occasions: ["Everyday", "Gift"],
  },
  {
    slug: "chains",
    label: "Chains",
    styleLabel: "Shop by Style",
    styles: ["Curb Chain", "Rope Chain", "Box Chain", "Figaro Chain"],
    occasions: ["Daily Wear", "Gift", "Party"],
  },
];

// Shared across every category dropdown — these map directly to real
// columns (material, price) so they're consistent everywhere.
export const METAL_OPTIONS = ["Gold", "Silver", "Platinum", "Rose Gold"];

// Bands sized to this catalog's actual price range (fine gold/diamond
// jewellery), not generic fashion-jewellery pricing — a "Under ₹500"
// band would just return an empty page for every product here.
export const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹10,000", max: 10000 },
  { label: "₹10,000 – ₹30,000", min: 10000, max: 30000 },
  { label: "₹30,000 – ₹75,000", min: 30000, max: 75000 },
  { label: "Above ₹75,000", min: 75000 },
];

// Men's Collection reuses the existing `gender` product field (already
// supported end-to-end in buildProductWhere/queryProducts — nothing new
// added there) combined with the site's existing categories. Chains now
// has its own real category (see CATEGORY_MENUS above and
// prisma/seed-categories.ts), so "Men's Chains" links straight to it.
// Studs/Watches still aren't separate categories in the current
// catalog, so those two route through the existing text-search `q`
// param instead of guessing at a category slug that doesn't exist —
// that keeps every link honest about what it can actually return
// today. If dedicated categories are added later via /admin/categories,
// switch their `mode` to "category" below.
export const MENS_CATEGORY_LINKS: {
  label: string;
  mode: "category" | "search";
  value: string;
}[] = [
  { label: "Men's Rings", mode: "category", value: "rings" },
  { label: "Men's Bracelets", mode: "category", value: "bracelets" },
  { label: "Men's Chains", mode: "category", value: "chains" },
  { label: "Men's Pendants", mode: "category", value: "pendants" },
  { label: "Men's Studs", mode: "search", value: "stud" },
  { label: "Men's Watches", mode: "search", value: "watch" },
];
