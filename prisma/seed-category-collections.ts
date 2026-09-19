// Run with: npm run seed:collections
//
// Optional, idempotent (safe to re-run, upsert-only, never deletes).
// Populates the per-category "Collection" rows (Halo, Band, Cocktail
// for Rings; Choker, Chain Necklace for Necklaces; etc.) that:
//   - power the admin Product form's category-dependent Collection
//     dropdown (Category = Rings → Collection options change to
//     Halo/Band/Cocktail), and
//   - power the frontend mega-menu's "Shop by Style" links,
// from the exact same `collections` table — a single source of truth
// instead of two hard-coded lists.
//
// This is intentionally a SEPARATE script from prisma/seed.ts, which is
// scoped to roles + the admin account only and must stay that way. This
// script only creates/updates Collection rows scoped to a category by
// slug; it never touches products, users, orders, or any other table,
// and never deletes anything that already exists.

import { PrismaClient } from "@prisma/client";
import { CATEGORY_MENUS } from "../lib/nav-data";
import { slugify } from "../lib/slugify";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const menu of CATEGORY_MENUS) {
    const category = await prisma.category.findUnique({ where: { slug: menu.slug } });
    if (!category) {
      console.warn(
        `⚠ Skipping "${menu.label}" collections — no category with slug "${menu.slug}" exists yet. ` +
          `Create it in /admin/categories first, then re-run this script.`
      );
      skipped += menu.styles.length;
      continue;
    }

    for (const styleName of menu.styles) {
      const slug = slugify(`${menu.slug}-${styleName}`);
      // Collection.name has a global unique constraint, and a few style
      // words repeat across categories in CATEGORY_MENUS (e.g. "Gold"
      // and "Diamond" both appear under Bangles and Pendants) — suffix
      // with the category label so every name stays unique without
      // touching that existing constraint.
      const name = `${styleName} – ${menu.label}`;
      const existing = await prisma.collection.findUnique({ where: { slug } });

      await prisma.collection.upsert({
        where: { slug },
        update: { categoryId: category.id, name },
        create: { name, slug, categoryId: category.id },
      });

      if (existing) updated++;
      else created++;
    }
  }

  console.log(`✔ Category collections seeded: ${created} created, ${updated} updated, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
