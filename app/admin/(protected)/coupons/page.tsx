import { prisma } from "@/lib/prisma";
import CouponsClient from "@/components/admin/CouponsClient";

export const metadata = { title: "Coupons | Admin | SS Creation Jewellery" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-6">Coupons / Offers</h1>
      <CouponsClient
        initialCoupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          type: c.type,
          discountValue: c.discountValue.toString(),
          minOrderValue: c.minOrderValue.toString(),
          maxDiscountAmount: c.maxDiscountAmount?.toString() ?? null,
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          startsAt: c.startsAt?.toISOString() ?? null,
          expiresAt: c.expiresAt?.toISOString() ?? null,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
