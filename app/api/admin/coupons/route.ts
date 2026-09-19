import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return ok({ coupons });
  } catch (err) {
    return apiError(err);
  }
}

const CreateCouponSchema = z.object({
  code: z.string().min(3).max(30),
  description: z.string().nullable().optional(),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const data = CreateCouponSchema.parse(await req.json());
    const code = data.code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return apiError({ status: 400, message: "A coupon with this code already exists." });

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: data.description ?? undefined,
        type: data.type,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue ?? 0,
        maxDiscountAmount: data.maxDiscountAmount ?? undefined,
        usageLimit: data.usageLimit ?? undefined,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isActive: data.isActive ?? true,
      },
    });
    return ok({ coupon }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
