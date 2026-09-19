import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
import { getCartForUser } from "@/lib/cart";

// GET /api/cart — returns the logged-in customer's cart with live product data
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { items, summary } = await getCartForUser(auth.userId);
    return ok({ items, summary });
  } catch (err) {
    return apiError(err);
  }
}

const AddToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(1).default(1),
});

// POST /api/cart — add (or increment) an item in the logged-in user's cart
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { productId, quantity } = AddToCartSchema.parse(await req.json());

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "ACTIVE") {
      return apiError({ status: 404, message: "Product not available" });
    }
    if (product.stockQuantity < quantity) {
      return apiError({ status: 400, message: "Not enough stock available" });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: auth.userId },
      update: {},
      create: { userId: auth.userId },
    });

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });

    return ok({ item }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
