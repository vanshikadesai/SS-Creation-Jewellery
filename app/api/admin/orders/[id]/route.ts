import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// :id accepts either the numeric primary key or the human-readable
// orderNumber (e.g. SSC-XXXXX), matching how /api/orders/:id already
// resolves orders customer-side, so the same links work in both places.
async function findOrder(id: string) {
  const numeric = Number(id);
  return prisma.order.findFirst({
    where: !Number.isNaN(numeric) ? { OR: [{ id: numeric }, { orderNumber: id }] } : { orderNumber: id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      address: true,
      user: { select: { id: true, fullName: true, email: true, mobile: true } },
    },
  });
}

// GET /api/admin/orders/:id — full order detail: customer info,
// shipping address, line items with product image/qty/price/subtotal,
// payment, and status — everything the "Order Detail" screen needs.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const order = await findOrder(params.id);
    if (!order) return apiError({ status: 404, message: "Order not found" });
    return ok({ order });
  } catch (err) {
    return apiError(err);
  }
}

const UpdateOrderSchema = z.object({
  orderStatus: z
    .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

// PATCH /api/admin/orders/:id — admin only. Updates order and/or
// payment status. A CANCELLED transition restocks every line item
// (writing an inventory_logs "RETURN" entry each) so cancelling an
// order doesn't silently strand stock as sold.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const data = UpdateOrderSchema.parse(await req.json());
    const existing = await findOrder(params.id);
    if (!existing) return apiError({ status: 404, message: "Order not found" });

    const nowCancelling =
      data.orderStatus === "CANCELLED" &&
      existing.orderStatus !== "CANCELLED" &&
      existing.orderStatus !== "RETURNED";

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: existing.id },
        data: {
          orderStatus: data.orderStatus,
          ...(data.paymentStatus
            ? { payment: { update: { status: data.paymentStatus } } }
            : {}),
        },
        include: { items: true, payment: true },
      });

      if (nowCancelling) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          const quantityAfter = product.stockQuantity + item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: quantityAfter },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              changeType: "RETURN",
              quantityChange: item.quantity,
              quantityAfter,
              note: `Order ${existing.orderNumber} cancelled`,
            },
          });
        }
      }

      return updated;
    });

    return ok({ order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
