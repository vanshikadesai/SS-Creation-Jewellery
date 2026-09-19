import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/admin/customers — every CUSTOMER-role user, with order count
// and lifetime spend computed straight from the same `orders` table the
// storefront writes to. Never selects passwordHash/resetToken.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim();
    const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 20) || 20));

    const where = {
      role: { name: "CUSTOMER" as const },
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { email: { contains: q } },
              { mobile: { contains: q } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
          orders: { select: { totalAmount: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const customers = users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile,
      status: u.status,
      createdAt: u.createdAt,
      orderCount: u.orders.length,
      totalSpent: u.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    }));

    return ok({
      customers,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  } catch (err) {
    return apiError(err);
  }
}
