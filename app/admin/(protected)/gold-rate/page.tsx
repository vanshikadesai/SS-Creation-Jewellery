import { prisma } from "@/lib/prisma";
import GoldRateClient from "@/components/admin/GoldRateClient";

export const metadata = { title: "Gold Rate | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminGoldRatePage() {
  const [goldRate, affectedProducts] = await Promise.all([
    prisma.goldRate.findFirst(),
    prisma.product.findMany({
      where: { autoGoldPricing: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, goldWeightGrams: true, goldPurity: true, price: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-2">Gold Rate</h1>
      <p className="text-sm text-charcoal/60 mb-8 max-w-2xl">
        Set today's 24K gold rate per gram. Every product with "Automatic gold pricing" enabled
        recalculates its Selling &amp; MRP price from this rate the moment you save it — other products
        are never touched.
      </p>
      <GoldRateClient
        initialRate={goldRate ? Number(goldRate.ratePerGram24k) : 0}
        lastUpdated={goldRate?.updatedAt.toISOString() ?? null}
        lastUpdatedBy={goldRate?.updatedByEmail ?? null}
        affectedProducts={affectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          goldWeightGrams: p.goldWeightGrams,
          goldPurity: p.goldPurity,
          price: p.price.toString(),
        }))}
      />
    </div>
  );
}
