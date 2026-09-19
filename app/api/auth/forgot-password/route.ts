import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api-utils";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const Schema = z.object({ email: z.string().email() });

// Generates and stores a real, single-use reset token in MySQL
// (users.reset_token / reset_token_expiry), then emails the reset link
// via lib/email.ts (nodemailer, SMTP credentials from env vars only).
// If SMTP isn't configured yet, sendEmail() logs to the console instead
// of failing the request — see .env.example to enable real delivery.
export async function POST(req: NextRequest) {
  try {
    const { email } = Schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if the user doesn't exist, so the API
    // can't be used to enumerate registered emails.
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      const { subject, html, text } = passwordResetEmail(resetUrl);
      await sendEmail({ to: user.email, subject, html, text });
    }

    return ok({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: "Enter a valid email address" });
    }
    return apiError(err);
  }
}
