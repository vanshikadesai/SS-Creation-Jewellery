import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { computeGoldPrice, MakingChargeType } from "@/lib/gold-pricing";

// The gold_rate table only ever has one row (id 1) — get-or-create it
// rather than requiring a separate setup step.
async function getOrCreateGoldRate() {
  const existing = await prisma.goldRate.findFirst();
  if (existing) return existing;
  return prisma.goldRate.create({ data: { ratePerGram24k: 0 } });
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const [rate, affectedCount] = await Promise.all([
      getOrCreateGoldRate(),
      prisma.product.count({ where: { autoGoldPricing: true } }),
    ]);
    return ok({ goldRate: rate, affectedProductCount: affectedCount });
  } catch (err) {
    return apiError(err);
  }
}

const UpdateGoldRateSchema = z.object({
  ratePerGram24k: z.number().positive(),
});

// PUT /api/admin/gold-rate — admin only. Updates the shared 24K
// gold-per-gram rate, then recomputes price/originalPrice for every
// product with autoGoldPricing: true using the exact same formula as
// the product form's live preview (lib/gold-pricing.ts). Non-gold /
// manually-priced products are never touched — this loop only ever
// looks at autoGoldPricing: true rows. Each changed price is written
// through product.update(), so it lands in price_history exactly like
// any other admin price edit (see app/api/products/[id]/route.ts).
export async function PUT(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    const data = UpdateGoldRateSchema.parse(await req.json());

    const products = await prisma.product.findMany({
      where: { autoGoldPricing: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      const existingRate = await tx.goldRate.findFirst();
      const goldRate = existingRate
        ? await tx.goldRate.update({
            where: { id: existingRate.id },
            data: { ratePerGram24k: data.ratePerGram24k, updatedByEmail: admin.email },
          })
        : await tx.goldRate.create({
            data: { ratePerGram24k: data.ratePerGram24k, updatedByEmail: admin.email },
          });

      let updated = 0;
      let skipped = 0;

      for (const product of products) {
        const priced = computeGoldPrice({
          goldWeightGrams: product.goldWeightGrams,
          goldPurity: product.goldPurity,
          makingChargeType: product.makingChargeType as MakingChargeType,
          makingChargeValue: Number(product.makingChargeValue),
          otherChargesAmount: Number(product.otherChargesAmount),
          ratePerGram24k: data.ratePerGram24k,
        });

        if (!priced) {
          // Missing/invalid gold weight or purity — can't auto-price
          // this one; leave its price untouched rather than guessing.
          skipped++;
          continue;
        }

        const previousPrice = Number(product.price);
        if (previousPrice !== priced.total) {
          const changeAmount = priced.total - previousPrice;
          const changePercent =
            previousPrice > 0 ? Math.round((changeAmount / previousPrice) * 1000) / 10 : 0;
          await tx.priceHistory.create({
            data: {
              productId: product.id,
              previousPrice,
              newPrice: priced.total,
              changeAmount,
              changePercent,
              changedByUserId: admin.userId,
            },
          });
        }

        await tx.product.update({
          where: { id: product.id },
          data: { price: priced.total, originalPrice: priced.total, discountPercent: 0 },
        });
        updated++;
      }

      return { goldRate, updated, skipped, totalAutoPriced: products.length };
    });

    return ok(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
