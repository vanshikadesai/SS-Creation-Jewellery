import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { computeGoldPrice } from "@/lib/gold-pricing";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        collection: true,
        reviews: {
          where: { status: "APPROVED" },
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!product) return apiError({ status: 404, message: "Product not found" });
    return ok({ product });
  } catch (err) {
    return apiError(err);
  }
}

const UpdateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().optional(),
  slug: z.string().min(1).optional(),
  categoryId: z.number().optional(),
  collectionId: z.number().nullable().optional(),
  material: z.string().min(1).optional(),
  goldPurity: z.string().nullable().optional(),
  goldWeightGrams: z.number().nullable().optional(),
  diamondWeightCt: z.number().nullable().optional(),
  diamondQuality: z.string().nullable().optional(),
  certification: z.string().nullable().optional(),
  gender: z.enum(["WOMEN", "MEN", "UNISEX", "KIDS"]).optional(),
  occasion: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  description: z.string().optional(),
  careInstructions: z.string().nullable().optional(),
  shippingInfo: z.string().nullable().optional(),
  returnInfo: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  // Full replacement of the product's image set, in display order.
  // Omit this field entirely to leave existing images untouched.
  images: z.array(z.string()).optional(),
  autoGoldPricing: z.boolean().optional(),
  makingChargeType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  makingChargeValue: z.number().min(0).optional(),
  otherChargesAmount: z.number().min(0).optional(),
});

// PUT /api/products/:id — admin only.
// This is the endpoint that proves frontend <-> backend <-> DB wiring:
// changing `price` here writes a price_history row, and changing
// `stockQuantity` writes an inventory_logs row. The storefront reads
// straight from `products`, so the change is live immediately.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(req);
    const productId = Number(params.id);
    const data = UpdateProductSchema.parse(await req.json());

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return apiError({ status: 404, message: "Product not found" });

    // If auto gold pricing is (or stays) enabled, the computed price
    // always wins over any manually-submitted price/originalPrice —
    // otherwise the two would drift the next time the gold rate
    // changes. Merge submitted fields over the existing row so editing
    // just the making charge, say, still recomputes correctly.
    const effectiveAutoGoldPricing = data.autoGoldPricing ?? existing.autoGoldPricing;
    if (effectiveAutoGoldPricing) {
      const goldRate = await prisma.goldRate.findFirst();
      const priced = computeGoldPrice({
        goldWeightGrams: data.goldWeightGrams !== undefined ? data.goldWeightGrams : existing.goldWeightGrams,
        goldPurity: data.goldPurity !== undefined ? data.goldPurity : existing.goldPurity,
        makingChargeType: (data.makingChargeType ?? existing.makingChargeType) as "PERCENTAGE" | "FLAT",
        makingChargeValue: data.makingChargeValue ?? Number(existing.makingChargeValue),
        otherChargesAmount: data.otherChargesAmount ?? Number(existing.otherChargesAmount),
        ratePerGram24k: Number(goldRate?.ratePerGram24k ?? 0),
      });
      if (!priced) {
        return apiError({
          status: 400,
          message:
            "Automatic gold pricing needs a valid Gold Weight and Gold Purity (and a gold rate set under Admin → Gold Rate).",
        });
      }
      data.price = priced.total;
      data.originalPrice = priced.total;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Price change → log to price_history
      if (data.price !== undefined && Number(existing.price) !== data.price) {
        const previousPrice = Number(existing.price);
        const changeAmount = data.price - previousPrice;
        const changePercent =
          previousPrice > 0 ? Math.round((changeAmount / previousPrice) * 1000) / 10 : 0;
        await tx.priceHistory.create({
          data: {
            productId,
            previousPrice,
            newPrice: data.price,
            changeAmount,
            changePercent,
            changedByUserId: admin.userId,
          },
        });
      }

      // Stock change → log to inventory_logs
      if (
        data.stockQuantity !== undefined &&
        existing.stockQuantity !== data.stockQuantity
      ) {
        await tx.inventoryLog.create({
          data: {
            productId,
            changeType: "ADJUSTMENT",
            quantityChange: data.stockQuantity - existing.stockQuantity,
            quantityAfter: data.stockQuantity,
            note: "Manual adjustment by admin",
          },
        });
      }

      const discountPercent =
        data.originalPrice || data.price
          ? Math.max(
              0,
              Math.round(
                (((data.originalPrice ?? Number(existing.originalPrice)) -
                  (data.price ?? Number(existing.price))) /
                  (data.originalPrice ?? Number(existing.originalPrice))) *
                  1000
              ) / 10
            )
          : existing.discountPercent;

      // `images` isn't a scalar column on `products` — it's replaced as
      // its own step below, never spread into product.update() data.
      const { images, ...scalarData } = data;

      const updated = await tx.product.update({
        where: { id: productId },
        data: { ...scalarData, discountPercent },
      });

      // Full image-set replacement: the admin edit form always submits
      // the complete, reordered list it wants saved, so the simplest
      // correct move is delete-all-then-recreate-in-order inside the
      // same transaction as everything else here.
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url, i) => ({ productId, url, sortOrder: i })),
          });
        }
      }

      return updated;
    });

    return ok({ product: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const productId = Number(params.id);

    const orderItemCount = await prisma.orderItem.count({ where: { productId } });
    if (orderItemCount > 0) {
      // Past orders reference this product row (order_items.product_id has
      // no cascade), so a hard delete would either fail on the FK
      // constraint or, worse, silently corrupt historical order records.
      // Archiving preserves order history and removes the product from
      // every customer-facing listing (queryProducts always filters
      // status: "ACTIVE").
      await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
      return ok({ success: true, archived: true });
    }

    await prisma.product.delete({ where: { id: productId } });
    return ok({ success: true, archived: false });
  } catch (err) {
    return apiError(err);
  }
}
