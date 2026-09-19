import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const Schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// POST /api/auth/reset-password — consumes the single-use token created by
// /api/auth/forgot-password (users.reset_token / reset_token_expiry).
export async function POST(req: NextRequest) {
  try {
    const { token, password } = Schema.parse(await req.json());

    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return apiError({ status: 400, message: "This reset link is invalid or has expired." });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return ok({ message: "Password updated. You can now log in." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
