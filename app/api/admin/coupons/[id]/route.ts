import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const UpdateCouponSchema = z.object({
  code: z.string().min(3).max(30).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = Number(params.id);
    const data = UpdateCouponSchema.parse(await req.json());

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return apiError({ status: 404, message: "Coupon not found" });

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code ? data.code.trim().toUpperCase() : undefined,
        description: data.description ?? undefined,
        type: data.type,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isActive: data.isActive,
      },
    });
    return ok({ coupon });
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
    await prisma.coupon.delete({ where: { id: Number(params.id) } });
    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
