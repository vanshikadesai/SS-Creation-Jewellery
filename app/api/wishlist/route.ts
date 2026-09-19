import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const Schema = z.object({ productId: z.number() });

// GET /api/wishlist — the logged-in customer's wishlist with live product data
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: auth.userId },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
          },
        },
      },
    });
    return ok({ items: wishlist?.items ?? [] });
  } catch (err) {
    return apiError(err);
  }
}

// POST /api/wishlist — add a product to the logged-in customer's wishlist
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { productId } = Schema.parse(await req.json());

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: auth.userId },
      update: {},
      create: { userId: auth.userId },
    });

    const item = await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      update: {},
      create: { wishlistId: wishlist.id, productId },
    });

    return ok({ item }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}

// DELETE /api/wishlist — remove a product from the logged-in customer's wishlist
export async function DELETE(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { productId } = Schema.parse(await req.json());

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: auth.userId } });
    if (!wishlist) return ok({ success: true });

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });

    return ok({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
