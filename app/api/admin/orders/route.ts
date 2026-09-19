import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/admin/orders — every order in the store (not scoped to one
// user, unlike the customer-facing /api/orders), with items, payment,
// and shipping address included for the admin orders table.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim();
    const status = sp.get("status");
    const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 20) || 20));

    const where = {
      ...(status ? { orderStatus: status as never } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customerName: { contains: q } },
              { customerEmail: { contains: q } },
              { customerMobile: { contains: q } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true, payment: true },
      }),
      prisma.order.count({ where }),
    ]);

    return ok({
      orders,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  } catch (err) {
    return apiError(err);
  }
}
