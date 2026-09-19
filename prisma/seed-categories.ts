// Run with: npm run seed:categories
//
// Fixes the "Add Product → Category dropdown only shows Necklace and
// Ring" issue. That dropdown (components/admin/ProductForm.tsx) and
// every Shop page filter already load categories dynamically from the
// database (see app/admin/(protected)/products/new/page.tsx and
// lib/products.ts's getFilterOptions()) — there is no hard-coded list
// anywhere in the code. If only two categories were showing, it's
// because only two rows exist in the `categories` table in this
// project's database.
//
// This script is additive and idempotent (safe to re-run): it uses
// upsert with an empty `update: {}`, so it only ever CREATES a category
// that doesn't exist yet by slug — it never modifies or deletes an
// existing category, image, or any other data. Categories already in
// your database (e.g. your existing Necklace and Ring rows) are left
// completely untouched.

import { PrismaClient } from "@prisma/client";
import { CATEGORY_MENUS } from "../lib/nav-data";
import { slugify } from "../lib/slugify";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let alreadyExisted = 0;

  for (const menu of CATEGORY_MENUS) {
    const slug = slugify(menu.slug);
    const existing = await prisma.category.findUnique({ where: { slug } });

    if (existing) {
      alreadyExisted++;
      continue;
    }

    // Also guard against a differently-slugged category that already
    // uses this exact name (e.g. an existing "Rings" row with a custom
    // slug) — name is unique too, so skip rather than error out.
    const nameClash = await prisma.category.findUnique({ where: { name: menu.label } });
    if (nameClash) {
      console.warn(
        `⚠ Skipping "${menu.label}" — a category with this exact name already exists (slug "${nameClash.slug}"). Left untouched.`
      );
      alreadyExisted++;
      continue;
    }

    await prisma.category.create({ data: { name: menu.label, slug } });
    created++;
  }

  console.log(`✔ Categories checked: ${created} created, ${alreadyExisted} already existed.`);
  if (created > 0) {
    console.log(`  Now run "npm run seed:collections" to add category-specific filter options (e.g. Studs/Hoops/Drops/Jhumkas under Earrings).`);
  }
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
