import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  label: z.string().min(1).max(30).optional(),
  fullName: z.string().min(1).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  line1: z.string().min(1).optional(),
  line2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

async function loadOwned(userId: number, addressId: number) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) return null;
  return address;
}

// PUT /api/addresses/:id — edit an address, or set it as default
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const addressId = Number(params.id);
    const data = UpdateSchema.parse(await req.json());

    const existing = await loadOwned(auth.userId, addressId);
    if (!existing) return apiError({ status: 404, message: "Address not found" });

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: auth.userId },
          data: { isDefault: false },
        });
      }
      return tx.address.update({ where: { id: addressId }, data });
    });

    return ok({ address });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}

// DELETE /api/addresses/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const addressId = Number(params.id);

    const existing = await loadOwned(auth.userId, addressId);
    if (!existing) return ok({ success: true });

    await prisma.address.delete({ where: { id: addressId } });

    // If we deleted the default address, promote the most recent
    // remaining one so checkout always has a sensible default.
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return ok({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
