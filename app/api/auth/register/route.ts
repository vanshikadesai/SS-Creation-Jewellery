import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is too short").max(100),
  email: z.string().email("Enter a valid email address"),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    if (data.password !== data.confirmPassword) {
      return apiError({ status: 400, message: "Passwords do not match" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { mobile: data.mobile }] },
    });
    if (existing) {
      return apiError({
        status: 409,
        message: "An account with this email or mobile already exists",
      });
    }

    const customerRole = await prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER" },
    });

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        passwordHash,
        roleId: customerRole.id,
      },
    });

    // Every customer gets an empty cart + wishlist created immediately.
    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.wishlist.create({ data: { userId: user.id } });

    const token = signToken({
      userId: user.id,
      role: "CUSTOMER",
      email: user.email,
    });

    const res = ok({
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
