# SS Creation Jewellery — E-Commerce Platform

**Organization:** SS Creation Jewellery, 1108 Kosha Complex, Malad East, Mumbai – 400097 · +91 99307 01983
**Project by:** Vanshika Desai (Roll No. 506)

A real, database-backed jewellery e-commerce platform: Next.js (App Router) frontend + API routes, Prisma ORM, MySQL. This README covers what's built in **Phase 1** and how to run it. It will be extended as each later phase is delivered.

---

## Build status

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup, MySQL schema, design system, homepage, header/footer | ✅ Done (this drop) |
| 2 | Auth pages (login/register/forgot-password UI), account dashboard | ✅ API done, pages next |
| 3 | Shop listing page, filters, search, product detail page | ⏳ Next |
| 4 | Cart page, wishlist page, checkout flow | ⏳ Next |
| 5 | Orders, reviews, newsletter admin view | ⏳ Next |
| 6 | Admin dashboard (charts, tables) | ⏳ Next |
| 7 | Price monitoring UI, inventory UI | ⏳ Next |
| 8 | Full demo seed data (20 products, 5 customers, orders, reviews) | ⏳ Next |
| 9 | Testing / bug fixing pass | ⏳ Next |
| 10 | Final README + deployment notes | ⏳ Next |

APIs already implemented and wired to real MySQL tables: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` (writes real `price_history` and `inventory_logs` rows), `GET/POST /api/cart`, `GET/POST/DELETE /api/wishlist`, `POST /api/newsletter`.

---

## Tech stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Swiper.js, lucide-react
- **Backend:** Next.js Route Handlers (REST API), Zod validation, JWT auth, bcryptjs password hashing
- **Database:** MySQL
- **ORM:** Prisma

A **unified Next.js architecture** (frontend + API routes + Prisma in one app) was chosen over a separate Express server because: one dev server, one deployment, no CORS configuration to maintain, and Route Handlers give the same REST semantics the spec asks for while sharing types directly with the UI. Prisma still gives a fully normalized, inspectable MySQL schema underneath — it's not "fake" — you can open it in MySQL Workbench, phpMyAdmin, or `prisma studio` at any time.

---

## Project structure

```
ss-creation-jewellery/
  app/
    layout.tsx, page.tsx, globals.css      → root layout + homepage
    (auth)/login, register, forgot-password → auth pages (Phase 2)
    (shop)/shop, product/[slug]             → catalog pages (Phase 3)
    (account)/account/...                   → customer dashboard (Phase 2/4)
    admin/...                               → admin dashboard (Phase 6/7)
    api/
      auth/{register,login,logout,forgot-password}
      products, products/[id]
      cart, wishlist
      newsletter
      orders, reviews, categories           → routes to be added Phase 4/5
      admin/{dashboard,customers,orders,products,reviews,price-history,inventory,newsletter}
  components/                               → Header, Footer, HeroSlider, ProductCard, etc.
  lib/
    prisma.ts     → Prisma client singleton
    auth.ts       → JWT + bcrypt helpers, requireAuth/requireAdmin
    api-utils.ts  → shared API response/error helper
  prisma/
    schema.prisma → full 18-table MySQL schema
    seed.ts       → to be added Phase 8
  public/images/{products,banners,categories}
  .env.example
```

---

## 1. Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- MySQL 8.x running locally or remotely
- VS Code (recommended extensions: Prisma, ESLint, Tailwind CSS IntelliSense)

## 2. Install dependencies

```bash
cd ss-creation-jewellery
npm install
```

## 3. Create the MySQL database

Open a MySQL shell (or MySQL Workbench) and run:

```sql
CREATE DATABASE ss_creation_jewellery;
```

## 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ss_creation_jewellery"
JWT_SECRET="generate-a-long-random-string"
ADMIN_EMAIL="admin@sscreation.com"
ADMIN_PASSWORD="ChangeThisPassword123!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a strong `JWT_SECRET` with:

```bash
openssl rand -base64 48
```

**Never commit `.env` to GitHub.** Only `.env.example` (with placeholder values) belongs in source control.

## 5. Run the migration (creates all 18 tables)

```bash
npx prisma migrate dev --name init
```

This reads `prisma/schema.prisma` and creates every table (`users`, `roles`, `products`, `categories`, `collections`, `product_images`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, `orders`, `order_items`, `addresses`, `payments`, `reviews`, `price_history`, `inventory_logs`, `newsletter_subscribers`) directly in your MySQL database, with real foreign keys and indexes.

## 6. Seed demo data

The seed script (`prisma/seed.ts`) ships in **Phase 8**. Once added:

```bash
npm run seed
```

## 7. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## How the pieces connect (already working today)

- **Customer registration** → `POST /api/auth/register` hashes the password with bcrypt (12 rounds) and inserts a real row into `users`, plus an empty `carts` and `wishlists` row for that user. A signed JWT is set as an httpOnly cookie.
- **Login** → `POST /api/auth/login` looks up the user by email, verifies the bcrypt hash, and issues a JWT.
- **Admin changes a product's price** → `PUT /api/products/:id` (admin-only, enforced by `requireAdmin`) updates `products.price` **and** inserts a row into `price_history` with `previous_price`, `new_price`, `change_amount`, `change_percent` — inside a single DB transaction. The storefront reads `products.price` directly, so the new price is live immediately on save, with zero caching to invalidate.
- **Admin changes stock** → same route logs a row to `inventory_logs`.
- **Wishlist / Cart** → both are keyed to the logged-in user's ID from the JWT (`requireAuth`), not to browser storage, so they persist across devices.
- **Newsletter** → the footer form on every page posts to `/api/newsletter`, which upserts into `newsletter_subscribers`.

---

## What's next

Phases 2–10 will land in follow-up messages, in the order listed in the build status table above, per the original phased build plan — each phase will keep everything from the phases before it working (no regressions), and the README will be extended with the setup notes for that phase (admin login, demo customer logins, image replacement guide, deployment, etc.) once those pieces exist.
