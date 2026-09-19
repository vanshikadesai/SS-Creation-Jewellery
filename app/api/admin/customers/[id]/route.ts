import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/admin/customers/:id — customer profile + full order history,
// for the "Customer Details + Order History" screen. passwordHash and
// reset tokens are never selected.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const userId = Number(params.id);

    const customer = await prisma.user.findFirst({
      where: { id: userId, role: { name: "CUSTOMER" } },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        status: true,
        createdAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true, payment: true },
        },
      },
    });
    if (!customer) return apiError({ status: 404, message: "Customer not found" });

    return ok({ customer });
  } catch (err) {
    return apiError(err);
  }
}

const UpdateCustomerSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
});

// PATCH /api/admin/customers/:id — admin only. Only the account status
// is editable here; every other field belongs to the customer's own
// account settings, not the admin panel.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const userId = Number(params.id);
    const data = UpdateCustomerSchema.parse(await req.json());

    const existing = await prisma.user.findFirst({
      where: { id: userId, role: { name: "CUSTOMER" } },
    });
    if (!existing) return apiError({ status: 404, message: "Customer not found" });

    const customer = await prisma.user.update({
      where: { id: userId },
      data: { status: data.status },
      select: { id: true, fullName: true, email: true, status: true },
    });
    return ok({ customer });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
