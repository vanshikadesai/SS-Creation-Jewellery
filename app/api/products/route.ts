import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { queryProducts } from "@/lib/products";
import { computeGoldPrice } from "@/lib/gold-pricing";

// GET /api/products
// Supports: q (search), category, collection, material, goldPurity,
// hasDiamond, gender, occasion, minPrice, maxPrice, inStock,
// featured, newArrival, bestSeller, sort, page, pageSize
// Filter/sort/pagination logic lives in lib/products.ts so the /shop
// server component and this route stay in sync.
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const result = await queryProducts({
      q: sp.get("q"),
      category: sp.get("category"),
      collection: sp.get("collection"),
      material: sp.get("material"),
      goldPurity: sp.get("goldPurity"),
      hasDiamond: sp.get("hasDiamond"),
      gender: sp.get("gender"),
      occasion: sp.get("occasion"),
      minPrice: sp.get("minPrice"),
      maxPrice: sp.get("maxPrice"),
      inStock: sp.get("inStock"),
      featured: sp.get("featured"),
      newArrival: sp.get("newArrival"),
      bestSeller: sp.get("bestSeller"),
      sort: sp.get("sort"),
      page: sp.get("page"),
      pageSize: sp.get("pageSize"),
    });
    return ok(result);
  } catch (err) {
    return apiError(err);
  }
}

const CreateProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.number(),
  collectionId: z.number().nullable().optional(),
  material: z.string().min(1),
  goldPurity: z.string().nullable().optional(),
  goldWeightGrams: z.number().nullable().optional(),
  diamondWeightCt: z.number().nullable().optional(),
  diamondQuality: z.string().nullable().optional(),
  certification: z.string().nullable().optional(),
  gender: z.enum(["WOMEN", "MEN", "UNISEX", "KIDS"]).optional(),
  occasion: z.string().nullable().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  description: z.string().min(1),
  careInstructions: z.string().nullable().optional(),
  shippingInfo: z.string().nullable().optional(),
  returnInfo: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  // Automatic gold pricing — see lib/gold-pricing.ts. When
  // autoGoldPricing is true, the submitted price/originalPrice are
  // ignored and recomputed here from goldWeightGrams + goldPurity + the
  // shared gold rate, so the two can never drift out of sync.
  autoGoldPricing: z.boolean().optional(),
  makingChargeType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  makingChargeValue: z.number().min(0).optional(),
  otherChargesAmount: z.number().min(0).optional(),
});

// POST /api/products — admin only, creates a product that immediately
// appears on the storefront (status ACTIVE by default). Every field the
// customer-facing product detail page (app/(shop)/product/[slug]/page.tsx)
// and /admin/products/new form can send is accepted here — this is the
// one product-creation path used by both.
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const data = CreateProductSchema.parse(await req.json());

    const [skuTaken, slugTaken] = await Promise.all([
      prisma.product.findUnique({ where: { sku: data.sku } }),
      prisma.product.findUnique({ where: { slug: data.slug } }),
    ]);
    if (skuTaken) return apiError({ status: 400, message: "A product with this SKU already exists." });
    if (slugTaken) return apiError({ status: 400, message: "A product with this slug already exists." });

    let price = data.price;
    let originalPrice = data.originalPrice;

    if (data.autoGoldPricing) {
      const goldRate = await prisma.goldRate.findFirst();
      const priced = computeGoldPrice({
        goldWeightGrams: data.goldWeightGrams,
        goldPurity: data.goldPurity,
        makingChargeType: data.makingChargeType ?? "PERCENTAGE",
        makingChargeValue: data.makingChargeValue ?? 0,
        otherChargesAmount: data.otherChargesAmount ?? 0,
        ratePerGram24k: Number(goldRate?.ratePerGram24k ?? 0),
      });
      if (!priced) {
        return apiError({
          status: 400,
          message:
            "Automatic gold pricing needs a valid Gold Weight and Gold Purity (and a gold rate set under Admin → Gold Rate).",
        });
      }
      price = priced.total;
      originalPrice = priced.total;
    }

    const discountPercent =
      originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 1000) / 10 : 0;

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        collectionId: data.collectionId ?? undefined,
        material: data.material,
        goldPurity: data.goldPurity ?? undefined,
        goldWeightGrams: data.goldWeightGrams ?? undefined,
        diamondWeightCt: data.diamondWeightCt ?? undefined,
        diamondQuality: data.diamondQuality ?? undefined,
        certification: data.certification ?? undefined,
        gender: data.gender ?? "UNISEX",
        occasion: data.occasion ?? undefined,
        price,
        originalPrice,
        discountPercent,
        autoGoldPricing: data.autoGoldPricing ?? false,
        makingChargeType: data.makingChargeType ?? "PERCENTAGE",
        makingChargeValue: data.makingChargeValue ?? 0,
        otherChargesAmount: data.otherChargesAmount ?? 0,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        status: data.status ?? "ACTIVE",
        description: data.description,
        careInstructions: data.careInstructions ?? undefined,
        shippingInfo: data.shippingInfo ?? undefined,
        returnInfo: data.returnInfo ?? undefined,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        isBestSeller: data.isBestSeller ?? false,
        images: data.images
          ? { create: data.images.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        changeType: "RESTOCK",
        quantityChange: data.stockQuantity,
        quantityAfter: data.stockQuantity,
        note: "Initial stock on product creation",
      },
    });

    return ok({ product }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
