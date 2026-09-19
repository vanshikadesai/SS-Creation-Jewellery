// Run with: npm run seed:demo-products
//
// Adds realistic DEMO jewellery products so the site isn't empty while
// real client products are being photographed/uploaded. This script:
//   - is additive and idempotent: every product is upserted by SKU, so
//     re-running it never creates duplicates and never touches a
//     product that already exists (yours or a previous demo run's).
//   - NEVER deletes or modifies any existing product, category, order,
//     or other data.
//   - creates products with NO images attached. That's intentional —
//     rather than downloading real jewellery photography from the web
//     (which would misrepresent someone else's copyrighted product
//     photos as SS Creation's own catalogue), each demo product shows
//     the site's existing neutral placeholder until a real photo is
//     uploaded. To add photos: Admin → Products → open a demo product
//     (search "DEMO-" in the SKU column) → Edit → upload images, or
//     Admin → Products → Add Product to replace a demo item with a
//     real one and then delete the demo row.
//
// Requires categories to already exist — run in this order:
//   npm run seed:categories
//   npm run seed:collections
//   npm run seed:demo-products

import { PrismaClient } from "@prisma/client";
import { CATEGORY_MENUS } from "../lib/nav-data";
import { slugify } from "../lib/slugify";

const prisma = new PrismaClient();

interface DemoSpec {
  name: string;
  material: string;
  goldPurity: string | null;
  goldWeightGrams: number | null;
  diamondWeightCt: number | null;
  diamondQuality: string | null;
  certification: string | null;
  price: number;
  originalPrice: number;
  occasion: string;
  gender: "WOMEN" | "MEN" | "UNISEX";
}

function ring(): DemoSpec[] {
  return [
    { name: "Imperial Diamond Solitaire Ring", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 4.2, diamondWeightCt: 0.5, diamondQuality: "VS1, F", certification: "IGI Certified", price: 89000, originalPrice: 98000, occasion: "Engagement", gender: "WOMEN" },
    { name: "Royal Heritage 22K Gold Band", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 6.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 52000, originalPrice: 56000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Halo Diamond Cocktail Ring", material: "18K Rose Gold", goldPurity: "18K", goldWeightGrams: 5.1, diamondWeightCt: 0.75, diamondQuality: "VS2, G", certification: "IGI Certified", price: 118000, originalPrice: 135000, occasion: "Party", gender: "WOMEN" },
    { name: "Classic Solitaire Promise Ring", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 3.4, diamondWeightCt: 0.3, diamondQuality: "SI1, G", certification: "IGI Certified", price: 62000, originalPrice: 68000, occasion: "Engagement", gender: "WOMEN" },
    { name: "Heritage Floral Gold Ring", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 5.8, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 46000, originalPrice: 49500, occasion: "Everyday", gender: "WOMEN" },
    { name: "Twin Halo Cocktail Ring", material: "18K Yellow Gold", goldPurity: "18K", goldWeightGrams: 4.8, diamondWeightCt: 0.6, diamondQuality: "VS2, F", certification: "IGI Certified", price: 95000, originalPrice: 108000, occasion: "Anniversary", gender: "WOMEN" },
    { name: "Everyday Stackable Gold Band", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 2.6, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 28500, originalPrice: 31000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Vintage Filigree Diamond Ring", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 4.0, diamondWeightCt: 0.4, diamondQuality: "VS1, G", certification: "IGI Certified", price: 78000, originalPrice: 86000, occasion: "Anniversary", gender: "WOMEN" },
    { name: "Men's Signet Gold Ring", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 8.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 58000, originalPrice: 62000, occasion: "Everyday", gender: "MEN" },
    { name: "Men's Diamond Band Ring", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 6.0, diamondWeightCt: 0.35, diamondQuality: "SI1, G", certification: "IGI Certified", price: 72000, originalPrice: 79000, occasion: "Wedding", gender: "MEN" },
  ];
}

function earring(): DemoSpec[] {
  return [
    { name: "Traditional Royal 22K Gold Jhumka Earrings", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 9.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 48500, originalPrice: 60000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Diamond Butterfly Dangle Earrings", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 3.8, diamondWeightCt: 0.55, diamondQuality: "VS2, G", certification: "IGI Certified", price: 145000, originalPrice: 179000, occasion: "Party", gender: "WOMEN" },
    { name: "Classic Gold Stud Earrings", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 1.8, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 18500, originalPrice: 20000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Emerald Drop Earrings", material: "18K Yellow Gold", goldPurity: "18K", goldWeightGrams: 4.5, diamondWeightCt: 0.2, diamondQuality: "VS1, G", certification: "IGI Certified", price: 68000, originalPrice: 75000, occasion: "Party", gender: "WOMEN" },
    { name: "Kundan Hoop Earrings", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 6.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 39500, originalPrice: 43000, occasion: "Festive", gender: "WOMEN" },
    { name: "Diamond Solitaire Stud Earrings", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 2.1, diamondWeightCt: 0.4, diamondQuality: "VS1, F", certification: "IGI Certified", price: 82000, originalPrice: 90000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Temple Gold Jhumka Earrings", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 10.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 54000, originalPrice: 58500, occasion: "Wedding", gender: "WOMEN" },
    { name: "Pearl Drop Gold Earrings", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 3.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 26500, originalPrice: 29000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Chandelier Diamond Earrings", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 5.6, diamondWeightCt: 0.65, diamondQuality: "VS2, G", certification: "IGI Certified", price: 158000, originalPrice: 185000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Minimal Gold Hoop Earrings", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 2.4, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 21000, originalPrice: 23000, occasion: "Everyday", gender: "WOMEN" },
  ];
}

function necklace(): DemoSpec[] {
  return [
    { name: "Royal Heritage 22K Gold Choker Necklace Set", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 28.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 185000, originalPrice: 239000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Diamond Solitaire Pendant Necklace", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 3.2, diamondWeightCt: 0.45, diamondQuality: "VS1, G", certification: "IGI Certified", price: 72000, originalPrice: 79000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Classic Gold Chain Necklace", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 14.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 72500, originalPrice: 78000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Layered Diamond Necklace", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 8.5, diamondWeightCt: 0.9, diamondQuality: "VS2, F", certification: "IGI Certified", price: 215000, originalPrice: 249000, occasion: "Party", gender: "WOMEN" },
    { name: "Temple Gold Necklace Set", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 32.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 198000, originalPrice: 215000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Delicate Gold Choker", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 9.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 48000, originalPrice: 52000, occasion: "Party", gender: "WOMEN" },
    { name: "Emerald Studded Gold Necklace", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 22.0, diamondWeightCt: 0.5, diamondQuality: "VS1, G", certification: "IGI Certified", price: 168000, originalPrice: 189000, occasion: "Festive", gender: "WOMEN" },
    { name: "Everyday Gold Pendant Chain", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 5.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 32500, originalPrice: 35000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Bridal Kundan Necklace Set", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 45.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 285000, originalPrice: 320000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Minimalist Diamond Bar Necklace", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 2.8, diamondWeightCt: 0.25, diamondQuality: "SI1, G", certification: "IGI Certified", price: 46000, originalPrice: 50000, occasion: "Everyday", gender: "WOMEN" },
  ];
}

function bracelet(): DemoSpec[] {
  return [
    { name: "Diamond Tennis Bracelet", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 6.5, diamondWeightCt: 1.2, diamondQuality: "VS1, F", certification: "IGI Certified", price: 225000, originalPrice: 260000, occasion: "Party", gender: "WOMEN" },
    { name: "Classic Gold Bracelet", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 12.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 62000, originalPrice: 66500, occasion: "Everyday", gender: "WOMEN" },
    { name: "Layered Chain Bracelet", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 5.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 29500, originalPrice: 32000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Emerald Gold Bracelet", material: "18K Yellow Gold", goldPurity: "18K", goldWeightGrams: 7.8, diamondWeightCt: 0.3, diamondQuality: "VS2, G", certification: "IGI Certified", price: 88000, originalPrice: 96000, occasion: "Party", gender: "WOMEN" },
    { name: "Charm Gold Bracelet", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 6.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 38500, originalPrice: 41500, occasion: "Everyday", gender: "WOMEN" },
    { name: "Diamond Cuff Bracelet", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 9.5, diamondWeightCt: 0.7, diamondQuality: "VS2, F", certification: "IGI Certified", price: 148000, originalPrice: 168000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Beaded Gold Bracelet", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 10.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 52000, originalPrice: 55500, occasion: "Festive", gender: "WOMEN" },
    { name: "Men's Gold Bracelet", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 18.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 92000, originalPrice: 98500, occasion: "Everyday", gender: "MEN" },
    { name: "Men's Royal Gold Bracelet", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 24.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 125000, originalPrice: 134000, occasion: "Wedding", gender: "MEN" },
    { name: "Men's Diamond Link Bracelet", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 14.0, diamondWeightCt: 0.4, diamondQuality: "SI1, G", certification: "IGI Certified", price: 118000, originalPrice: 129000, occasion: "Party", gender: "MEN" },
  ];
}

function bangle(): DemoSpec[] {
  return [
    { name: "Classic 22K Gold Bangle", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 16.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 88000, originalPrice: 94500, occasion: "Everyday", gender: "WOMEN" },
    { name: "Diamond Studded Bangle", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 12.0, diamondWeightCt: 0.6, diamondQuality: "VS2, G", certification: "IGI Certified", price: 158000, originalPrice: 178000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Bridal Gold Bangle Set (Pair)", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 38.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 195000, originalPrice: 215000, occasion: "Wedding", gender: "WOMEN" },
    { name: "Daily Wear Gold Bangle", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 9.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 52000, originalPrice: 56000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Kada Style Gold Bangle", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 22.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 112000, originalPrice: 120000, occasion: "Festive", gender: "WOMEN" },
    { name: "Twisted Gold Bangle", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 10.8, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 58500, originalPrice: 62500, occasion: "Party", gender: "WOMEN" },
    { name: "Diamond Eternity Bangle", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 13.5, diamondWeightCt: 0.85, diamondQuality: "VS1, F", certification: "IGI Certified", price: 198000, originalPrice: 225000, occasion: "Anniversary", gender: "WOMEN" },
    { name: "Traditional Engraved Bangle", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 19.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 96500, originalPrice: 103000, occasion: "Festive", gender: "WOMEN" },
    { name: "Slim Gold Bangle Set (Set of 4)", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 24.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 118000, originalPrice: 126000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Men's Gold Kada", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 32.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 158000, originalPrice: 169000, occasion: "Everyday", gender: "MEN" },
  ];
}

function pendant(): DemoSpec[] {
  return [
    { name: "Diamond Butterfly Pendant", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 2.4, diamondWeightCt: 0.35, diamondQuality: "VS1, G", certification: "IGI Certified", price: 58000, originalPrice: 64000, occasion: "Gift", gender: "WOMEN" },
    { name: "Classic Gold Om Pendant", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 3.8, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 21500, originalPrice: 23000, occasion: "Everyday", gender: "UNISEX" },
    { name: "Solitaire Diamond Pendant", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 1.9, diamondWeightCt: 0.4, diamondQuality: "VS2, F", certification: "IGI Certified", price: 68000, originalPrice: 75000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Heart Shaped Gold Pendant", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 2.8, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 19500, originalPrice: 21000, occasion: "Gift", gender: "WOMEN" },
    { name: "Emerald Drop Pendant", material: "18K Yellow Gold", goldPurity: "18K", goldWeightGrams: 3.2, diamondWeightCt: 0.15, diamondQuality: "VS1, G", certification: "IGI Certified", price: 42000, originalPrice: 46000, occasion: "Gift", gender: "WOMEN" },
    { name: "Traditional Gold Locket Pendant", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 5.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 29500, originalPrice: 31500, occasion: "Festive", gender: "WOMEN" },
    { name: "Diamond Cluster Pendant", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 2.6, diamondWeightCt: 0.3, diamondQuality: "SI1, G", certification: "IGI Certified", price: 48500, originalPrice: 53000, occasion: "Everyday", gender: "WOMEN" },
    { name: "Infinity Gold Pendant", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 2.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 16500, originalPrice: 18000, occasion: "Gift", gender: "WOMEN" },
    { name: "Men's Gold Pendant", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 6.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 31000, originalPrice: 33000, occasion: "Everyday", gender: "MEN" },
    { name: "Men's Diamond Cross Pendant", material: "18K White Gold", goldPurity: "18K", goldWeightGrams: 4.0, diamondWeightCt: 0.2, diamondQuality: "SI1, G", certification: "IGI Certified", price: 46000, originalPrice: 50000, occasion: "Gift", gender: "MEN" },
  ];
}

function chain(): DemoSpec[] {
  return [
    { name: "Classic Gold Curb Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 12.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 65000, originalPrice: 70000, occasion: "Everyday", gender: "UNISEX" },
    { name: "Rope Twist Gold Chain", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 8.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 42000, originalPrice: 45500, occasion: "Everyday", gender: "UNISEX" },
    { name: "Box Link Gold Chain", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 6.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 34000, originalPrice: 37000, occasion: "Everyday", gender: "UNISEX" },
    { name: "Figaro Gold Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 10.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 53000, originalPrice: 57000, occasion: "Everyday", gender: "UNISEX" },
    { name: "Men's Heavy Gold Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 22.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 112000, originalPrice: 120000, occasion: "Everyday", gender: "MEN" },
    { name: "Men's Rope Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 16.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 84000, originalPrice: 90000, occasion: "Everyday", gender: "MEN" },
    { name: "Delicate Gold Chain", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 3.5, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 18500, originalPrice: 20000, occasion: "Gift", gender: "WOMEN" },
    { name: "Men's Figaro Gold Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 18.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 92000, originalPrice: 98000, occasion: "Everyday", gender: "MEN" },
    { name: "Layered Gold Chain Set", material: "18K Gold", goldPurity: "18K", goldWeightGrams: 7.2, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 38500, originalPrice: 42000, occasion: "Party", gender: "WOMEN" },
    { name: "Men's Byzantine Gold Chain", material: "22K Gold", goldPurity: "22K", goldWeightGrams: 25.0, diamondWeightCt: null, diamondQuality: null, certification: "BIS Hallmarked", price: 128000, originalPrice: 137000, occasion: "Wedding", gender: "MEN" },
  ];
}

const CATEGORY_PRODUCTS: Record<string, () => DemoSpec[]> = {
  rings: ring,
  earrings: earring,
  necklaces: necklace,
  bracelets: bracelet,
  bangles: bangle,
  pendants: pendant,
  chains: chain,
};

async function main() {
  let created = 0;
  let skipped = 0;

  for (const menu of CATEGORY_MENUS) {
    const specFn = CATEGORY_PRODUCTS[menu.slug];
    if (!specFn) continue;

    const category = await prisma.category.findUnique({ where: { slug: menu.slug } });
    if (!category) {
      console.warn(`⚠ Skipping demo products for "${menu.label}" — category doesn't exist yet. Run "npm run seed:categories" first.`);
      continue;
    }

    const specs = specFn();
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const sku = `DEMO-${menu.slug.toUpperCase()}-${String(i + 1).padStart(3, "0")}`;
      const slug = slugify(spec.name);

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        skipped++;
        continue;
      }
      const slugTaken = await prisma.product.findUnique({ where: { slug } });
      if (slugTaken) {
        skipped++;
        continue;
      }

      const discountPercent =
        spec.originalPrice > spec.price
          ? Math.round(((spec.originalPrice - spec.price) / spec.originalPrice) * 1000) / 10
          : 0;

      await prisma.product.create({
        data: {
          sku,
          name: spec.name,
          slug,
          categoryId: category.id,
          material: spec.material,
          goldPurity: spec.goldPurity ?? undefined,
          goldWeightGrams: spec.goldWeightGrams ?? undefined,
          diamondWeightCt: spec.diamondWeightCt ?? undefined,
          diamondQuality: spec.diamondQuality ?? undefined,
          certification: spec.certification ?? undefined,
          gender: spec.gender,
          occasion: spec.occasion,
          price: spec.price,
          originalPrice: spec.originalPrice,
          discountPercent,
          stockQuantity: 15,
          status: "ACTIVE",
          description: `${spec.name} — crafted in ${spec.material}${
            spec.goldPurity ? ` (${spec.goldPurity})` : ""
          }, ideal for ${spec.occasion.toLowerCase()} wear. Demo product — replace this description and its photos from Admin → Products before going live.`,
          careInstructions: "Store separately in a soft pouch. Avoid contact with perfume, water and harsh chemicals. Clean gently with a soft jewellery cloth.",
          shippingInfo: "Free, fully insured shipping across India.",
          returnInfo: "7-day return policy on unworn items with original packaging and certification.",
          isNewArrival: i % 4 === 0,
          isBestSeller: i % 5 === 0,
          isFeatured: i === 0,
        },
      });
      created++;
    }
  }

  console.log(`✔ Demo products seeded: ${created} created, ${skipped} already existed (skipped).`);

  // Best-effort: if the global "Gold Collection" / "Bridal Collection"
  // collections already exist in your database (they're independent of
  // the per-category ones above), tag a handful of the 22K/wedding demo
  // products into them so those homepage rails aren't empty. Skipped
  // silently if either collection doesn't exist — never creates one.
  const [goldCollection, bridalCollection] = await Promise.all([
    prisma.collection.findUnique({ where: { slug: "gold-collection" } }),
    prisma.collection.findUnique({ where: { slug: "bridal-collection" } }),
  ]);
  if (goldCollection) {
    await prisma.product.updateMany({
      where: { sku: { startsWith: "DEMO-" }, goldPurity: "22K", collectionId: null },
      data: { collectionId: goldCollection.id },
    });
  }
  if (bridalCollection) {
    await prisma.product.updateMany({
      where: { sku: { startsWith: "DEMO-" }, occasion: "Wedding", collectionId: null },
      data: { collectionId: bridalCollection.id },
    });
  }

  console.log(`  These have no images yet — upload real photography per product from Admin → Products → Edit.`);
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
