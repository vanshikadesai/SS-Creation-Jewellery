import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-utils";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });

    // Same error for "no user" and "wrong password" to avoid leaking
    // which emails are registered.
    if (!user || user.status !== "ACTIVE") {
      return apiError({ status: 401, message: "Invalid email or password" });
    }

    const validPassword = await verifyPassword(data.password, user.passwordHash);
    if (!validPassword) {
      return apiError({ status: 401, message: "Invalid email or password" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role.name,
      email: user.email,
    });

    const res = ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
      },
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
