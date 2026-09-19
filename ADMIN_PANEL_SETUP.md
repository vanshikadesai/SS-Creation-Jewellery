# Admin Panel (Phase 3) — Setup Notes

This build adds a full, working admin panel on top of your **existing**
Next.js + TypeScript + Prisma + MySQL project. Nothing from Phase 1/2 was
removed, renamed, or reset. No new database, no paid services.

## 1. What changed in the schema (additive only)

Two new tables were added to `prisma/schema.prisma` — nothing existing
was touched:

- `Coupon` — for `/admin/coupons`
- `Banner` — for `/admin/banners` (and the homepage hero, which now reads
  active banners from this table)

To apply this to your database **without resetting or losing any data**,
run:

```bash
npx prisma migrate dev --name admin_panel_phase3
npx prisma generate
```

This creates two new tables (`coupons`, `banners`) via `CREATE TABLE`
migrations. It does **not** touch `products`, `orders`, `users`, or any
other existing table or row. Do not run `prisma migrate reset` or
`prisma db push --force-reset` — those are destructive and were
intentionally avoided here.

## 2. Product images (no paid service)

Product/banner photos are uploaded straight to your own server's disk at
`public/uploads/products/`, `public/uploads/banners/`, and
`public/uploads/categories/`, via a new endpoint:
`POST /api/admin/upload`. The returned URL (e.g.
`/uploads/products/xyz.jpg`) is stored on `ProductImage.url` /
`Banner.imageUrl` exactly like the existing image fields already work —
`SafeImage` renders it with zero changes. If you deploy somewhere with an
ephemeral filesystem (e.g. some serverless hosts), mount a persistent
volume at `public/uploads` or point `saveUploadedImage()` in
`lib/upload.ts` at that volume's path.

## 3. What's new

- **Dashboard** (`/admin/dashboard`) — live counts (customers, products,
  orders, revenue, order-status breakdown, low stock) and recent
  orders/customers/products, all queried straight from MySQL.
- **Products** (`/admin/products`, `/admin/products/new`,
  `/admin/products/[id]/edit`) — full CRUD, search/filter, multi-image
  upload with drag-to-reorder and primary-image selection. Saving a
  product writes to the same `products` table the storefront reads —
  new products with `status: ACTIVE` appear immediately on `/shop`,
  `/shop?category=<slug>`, and their product detail page.
- **Categories & Collections** (`/admin/categories`) — add/edit/delete,
  wired to the same tables the product form and `/shop` filters use.
- **Inventory** (`/admin/inventory`) — stock table with inline editing;
  every change writes an `inventory_logs` row via the existing product
  API, same as before.
- **Orders** (`/admin/orders`, `/admin/orders/[id]`) — full order list
  and detail (customer, shipping address, line items, payment), with
  order/payment status updates. Cancelling an order automatically
  restores stock for its items.
- **Customers** (`/admin/customers`, `/admin/customers/[id]`) — customer
  list with order count/lifetime spend, and a detail page with full
  order history. Passwords are never exposed.
- **Coupons/Offers** (`/admin/coupons`) — create/edit/enable/disable/
  delete, with min order value, usage limit, and expiry.
- **Banners** (`/admin/banners`) — create/edit/enable/disable/delete;
  active banners appear on the homepage hero automatically (falls back
  to the original static hero slides if none are published yet).

## 4. Security

Every `/admin/*` page is behind the existing `(protected)` layout
(`app/admin/(protected)/layout.tsx`), which redirects anyone who isn't
logged in as `ADMIN`. Every new `/api/admin/*` route independently calls
`requireAdmin(req)` (`lib/auth.ts`) server-side and returns a 401/403 if
the caller isn't an authenticated admin — this is enforced at the API
layer, not just by hiding buttons in the UI.

## 5. Manual verification checklist

Since this sandbox has no network access to your MySQL instance, this
was built and reviewed carefully field-by-field against your actual
Prisma schema, but hasn't been run against a live database. Please
verify in your own environment:

1. `npm install` (installs `lucide-react`, already in your
   `package.json`)
2. `npx prisma migrate dev --name admin_panel_phase3`
3. `npx prisma generate`
4. `npm run seed` (idempotent — safe to re-run, only touches the roles
   table and your one admin account)
5. `npm run dev`
6. Log in at `/admin/login` → Dashboard shows real counts
7. `/admin/products/new` → fill the form, upload an image, select a
   category, Save Product
8. Open `/shop?category=<that category>` → confirm the new product
   appears; open its product page → confirm every field and the image
   render; Add to Cart still works
9. Place a test order as a customer → `/admin/orders` shows it with the
   correct customer, items, quantities, and totals
