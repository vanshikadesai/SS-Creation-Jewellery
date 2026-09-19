import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/orders/:id — :id is the human-readable orderNumber (e.g.
// SSC-XXXXX), not the numeric primary key, since that's what's in the URL
// on the confirmation page and matches customer-facing order references.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.id },
      include: { items: true, payment: true, address: true },
    });
    if (!order || order.userId !== auth.userId) {
      return apiError({ status: 404, message: "Order not found" });
    }
    return ok({ order });
  } catch (err) {
    return apiError(err);
  }
}
