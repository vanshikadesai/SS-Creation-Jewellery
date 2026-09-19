import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

// GET /api/addresses — logged-in customer's saved addresses, default first
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const addresses = await prisma.address.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok({ addresses });
  } catch (err) {
    return apiError(err);
  }
}

const AddressSchema = z.object({
  label: z.string().min(1).max(30).default("Home"),
  fullName: z.string().min(1),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
  isDefault: z.boolean().optional(),
});

// POST /api/addresses — add a new address; first address for a user
// (or one explicitly marked default) becomes the default automatically.
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const data = AddressSchema.parse(await req.json());

    const existingCount = await prisma.address.count({ where: { userId: auth.userId } });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    const address = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: auth.userId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: { ...data, userId: auth.userId, isDefault: shouldBeDefault },
      });
    });

    return ok({ address }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
