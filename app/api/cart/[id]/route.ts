import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const UpdateSchema = z.object({ quantity: z.number().int().min(1).max(20) });

async function loadOwnedItem(userId: number, itemId: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });
  if (!item || item.cart.userId !== userId) return null;
  return item;
}

// PATCH /api/cart/:id — update quantity of one cart item (increase/decrease)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const { quantity } = UpdateSchema.parse(await req.json());
    const itemId = Number(params.id);

    const item = await loadOwnedItem(auth.userId, itemId);
    if (!item) return apiError({ status: 404, message: "Cart item not found" });

    if (item.product.stockQuantity < quantity) {
      return apiError({ status: 400, message: "Not enough stock available" });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return ok({ item: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}

// DELETE /api/cart/:id — remove one item from the logged-in user's cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const itemId = Number(params.id);

    const item = await loadOwnedItem(auth.userId, itemId);
    if (!item) return ok({ success: true });

    await prisma.cartItem.delete({ where: { id: itemId } });
    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
