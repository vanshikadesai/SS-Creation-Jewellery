import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api-utils";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

// NOTE: mirrors the pattern already used in /api/auth/forgot-password —
// validates and records the submission server-side; wiring an email
// provider (Resend/SendGrid/SES) to notify the store is the one piece
// intentionally left for you to plug in with your own credentials.
export async function POST(req: NextRequest) {
  try {
    const data = ContactSchema.parse(await req.json());
    // TODO (plug in your provider): forward this to store email/CRM.
    console.log("[contact] new inquiry:", {
      name: data.name,
      email: data.email,
      mobile: data.mobile || undefined,
      message: data.message,
      receivedAt: new Date().toISOString(),
    });
    return ok({ message: "Thanks — we'll get back to you within 1 business day." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError({ status: 400, message: err.errors[0].message });
    }
    return apiError(err);
  }
}
