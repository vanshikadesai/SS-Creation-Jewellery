# This Update — Category Dropdown Fix

## What was actually wrong

Nothing in the code. Both the Add/Edit Product form's Category dropdown
(`components/admin/ProductForm.tsx`) and every Shop page filter
(`lib/products.ts`'s `getFilterOptions()`) already load categories and
collections dynamically from your database — there is no hard-coded
category list anywhere in the project. If only "Necklace" and "Ring"
were showing, it's simply because those were the only two rows that
existed in your `categories` table, and there were no category-specific
`collections` rows at all (which is what made the Collection field look
stuck/empty after picking a category).

## What this update adds

1. **`prisma/seed-categories.ts`** (new) — an additive, idempotent
   script that creates any of the 7 standard categories (Rings,
   Necklaces, Earrings, Bracelets, Bangles, Pendants, **Chains** — new
   this round) that don't already exist in your database. It never
   modifies or deletes a category you already have; it only fills in
   the missing ones by name/slug.
2. **`lib/nav-data.ts`** — added a `Chains` entry (with its own style
   and occasion options: Curb Chain, Rope Chain, Box Chain, Figaro
   Chain / Daily Wear, Gift, Party), since your request specifically
   asked for Chains to have its own respective filters like the other
   categories. This also means Chains now appears as its own item in
   the navbar mega-menu, exactly like Rings/Necklaces/etc. — the same
   existing pattern extended to a 7th category, not a new design.
3. **`package.json`** — added a `seed:categories` script.

`prisma/seed-category-collections.ts` (from the previous update) is
unchanged — it already reads categories generically from
`lib/nav-data.ts`, so it automatically picks up Chains too.

## How to fix your dropdown — run these in order

```bash
npm run seed:categories
npm run seed:collections
```

After this:
- Add/Edit Product → Category dropdown will show all 7 categories.
- Selecting a category (e.g. Earrings) will populate the Collection
  dropdown with that category's specific options (e.g. "Studs –
  Earrings", "Hoops – Earrings", "Drops – Earrings", "Jhumkas –
  Earrings") instead of showing "None" or nothing.
- The Occasion field's suggestions (the small text under it) will also
  match that category (e.g. Party/Wedding/Everyday for Earrings).

## How "Category = Earrings + Type = Hoops + Occasion = Wedding + Metal = Gold" works end-to-end

- **Type** → the Collection field, scoped to the selected category (see
  above). Saved on `Product.collectionId`.
- **Occasion** → the free-text Occasion field (with category-matching
  suggestions). Saved on `Product.occasion`.
- **Metal** → the existing Material field. Saved on `Product.material`.
  The Shop page's "Metal" filter and the navbar's "Shop by Metal" links
  match against this field with a partial (`contains`) match, so
  entering e.g. "18K Gold" as the Material will correctly match a
  "Gold" metal filter.
- **Price / Gender / Collection** — already existing fields, unchanged.

All four are already read by the exact same `buildProductWhere()`
function that powers both the Shop page sidebar filters and the navbar
mega-menu quick-filter links — there is only ever one filtering system
in this project, so a product saved with those four values will
correctly appear under Category=Earrings, the Hoops style link, the
Wedding occasion link, and the Gold metal filter, all at once.

## Nothing else changed

No existing UI, styling, page, API route, database column, or other
feature was touched in this update — only the two new seed scripts and
the one new `Chains` entry in `lib/nav-data.ts` described above.
