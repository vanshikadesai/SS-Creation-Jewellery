import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api-utils";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = Schema.parse(await req.json());
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: "ACTIVE" },
      create: { email },
    });
    return ok({ subscriber: sub }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: "Enter a valid email address" });
    }
    return apiError(err);
  }
}
