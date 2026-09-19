import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/orders — logged-in customer's order history, newest first
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return ok({ orders });
  } catch (err) {
    return apiError(err);
  }
}

const CreateOrderSchema = z.object({
  addressId: z.number(),
});

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SSC-${stamp}-${rand}`;
}

// POST /api/orders — creates an order from the user's current cart.
// Prices are always re-read from the `products` table here — a price
// (or stale stock number) sent from the browser is never trusted.
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { addressId } = CreateOrderSchema.parse(await req.json());

    const [user, address, cart] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId } }),
      prisma.address.findUnique({ where: { id: addressId } }),
      prisma.cart.findUnique({
        where: { userId: auth.userId },
        include: { items: { include: { product: true } } },
      }),
    ]);

    if (!user) return apiError({ status: 404, message: "User not found" });
    if (!address || address.userId !== auth.userId) {
      return apiError({ status: 400, message: "Select a valid shipping address" });
    }
    if (!cart || cart.items.length === 0) {
      return apiError({ status: 400, message: "Your cart is empty" });
    }

    for (const item of cart.items) {
      if (item.product.status !== "ACTIVE") {
        return apiError({
          status: 400,
          message: `${item.product.name} is no longer available`,
        });
      }
      if (item.product.stockQuantity < item.quantity) {
        return apiError({
          status: 400,
          message: `Only ${item.product.stockQuantity} left in stock for ${item.product.name}`,
        });
      }
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + Number(i.product.price) * i.quantity,
      0
    );
    const discountAmount = cart.items.reduce(
      (sum, i) =>
        sum + (Number(i.product.originalPrice) - Number(i.product.price)) * i.quantity,
      0
    );
    const shippingAmount = subtotal > 50000 ? 0 : 500;
    const taxAmount = Math.round(subtotal * 0.03);
    const totalAmount = subtotal + shippingAmount + taxAmount;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: auth.userId,
          customerName: user.fullName,
          customerEmail: user.email,
          customerMobile: user.mobile,
          addressId: address.id,
          shippingAddressSnapshot: [
            address.fullName,
            address.line1,
            address.line2,
            `${address.city}, ${address.state} ${address.pincode}`,
            address.country,
            `Phone: ${address.phone}`,
          ]
            .filter(Boolean)
            .join("\n"),
          subtotal,
          discountAmount,
          taxAmount,
          shippingAmount,
          totalAmount,
          orderStatus: "CONFIRMED",
          isDemo: true,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              productName: i.product.name,
              productSku: i.product.sku,
              quantity: i.quantity,
              unitPrice: i.product.price,
              lineTotal: Number(i.product.price) * i.quantity,
            })),
          },
          payment: {
            create: {
              method: "DEMO",
              status: "PAID",
              transactionRef: `DEMO-${Date.now()}`,
              amount: totalAmount,
            },
          },
        },
        include: { items: true, payment: true },
      });

      for (const item of cart.items) {
        const quantityAfter = item.product.stockQuantity - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: quantityAfter },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: "SALE",
            quantityChange: -item.quantity,
            quantityAfter,
            note: `Order ${created.orderNumber}`,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return ok({ order }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
