# This Update — Setup Notes

Three changes only, per your request. Nothing else was touched.

## 1. Category-based product filters — already in place, verified

The admin Add/Edit Product form's Collection dropdown already filters to
the selected category (Rings → Halo/Band/Cocktail/Solitaire, Earrings →
Studs/Hoops/Drops/Jhumkas, etc.) from earlier work in this project. I
re-verified it end-to-end this round and made no changes — it was
already wired to `lib/nav-data.ts` and the `collections` table exactly
as requested. If you haven't already run it, `npm run seed:collections`
populates those category-specific options from that same config.

## 2. Men's Collection

No schema change — this reuses the existing `Product.gender` field
(already `WOMEN | MEN | UNISEX | KIDS`, already wired to the storefront
Men's Collection section from earlier work). The Add/Edit Product form's
Gender field now reads **"Gender / Collection"** and shows a note when
"Men" is selected confirming it will appear in Men's Collection.
Women/Unisex/Kids products are completely unaffected.

## 3. Automatic gold pricing — new

**Schema (additive only — run this migration):**

```bash
npx prisma migrate dev --name gold_auto_pricing
npx prisma generate
```

This adds one new table (`gold_rate`) and four new columns on
`products` (`auto_gold_pricing`, `making_charge_type`,
`making_charge_value`, `other_charges_amount`), all with safe defaults.
No existing table, column, or row is touched — every existing product
keeps its current price untouched (`auto_gold_pricing` defaults to
`false`).

**How it works:**
- New page: **Admin → Gold Rate** — set today's 24K gold rate (₹/gram).
- On the product form, check **"Automatic gold pricing"** to have
  Selling & MRP price calculated from `Gold Weight × Gold Purity × gold
  rate + making charge (+ optional other charges e.g. diamonds/stones)`,
  live-previewed as you type. Price fields become read-only for that
  product — the server always computes the authoritative value from the
  same formula (`lib/gold-pricing.ts`), so it can't drift.
- Whenever you update the rate on **Admin → Gold Rate**, every product
  with auto-pricing enabled is recalculated immediately, each price
  change logged to the existing `price_history` table exactly like any
  manual price edit.
- **Products without auto-pricing enabled are never touched** by a gold
  rate change — this only loops over `autoGoldPricing: true` rows.
- Purity handling: recognizes "24K/22K/18K/14K/10K/9K" (case-insensitive)
  or any bare karat number (e.g. "20K" → 20/24 purity).

## Verification checklist

1. `npm install && npx prisma migrate dev --name gold_auto_pricing && npx prisma generate && npm run dev`
2. Admin → Gold Rate → set a rate (e.g. 7500) → Save.
3. Admin → Products → Add Product → enable "Automatic gold pricing",
   enter Gold Weight + Gold Purity + a making charge → confirm the
   preview price appears → Save → confirm the saved product shows that
   price.
4. Change the gold rate again → confirm that product's price updates,
   and confirm any existing non-gold / manually-priced product's price
   is unchanged.
5. Add/edit a product with Gender = Men → confirm it appears under the
   storefront's Men's Collection.
6. Add a Rings product → confirm the Collection dropdown only shows
   Ring-specific options, and that switching Category to Earrings swaps
   the options.
