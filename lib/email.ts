import nodemailer from "nodemailer";

// All SMTP credentials come from environment variables only — never
// hardcoded here. See .env.example for the exact variable names. If
// SMTP isn't configured (e.g. in local development), sendEmail() logs
// the email to the console instead of throwing, so the rest of the app
// (like password reset) keeps working without crashing — you'll just
// need to configure real SMTP credentials before this reaches users.

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return cachedTransporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || "SS Creation Jewellery <no-reply@sscreation.example>";

  if (!transporter) {
    // No SMTP configured — don't crash the request (e.g. forgot
    // password should still "succeed" in dev), just make it obvious in
    // the server logs that no real email was sent.
    console.warn(
      `[email] SMTP not configured — would have sent "${subject}" to ${to}. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD in .env to send real emails.`
    );
    console.warn(`[email] Preview text:\n${text}`);
    return { sent: false };
  }

  await transporter.sendMail({ from, to, subject, html, text });
  return { sent: true };
}

export function passwordResetEmail(resetUrl: string) {
  const subject = "Reset Your SS Creation Jewellery Password";
  const text = `Hello,\n\nWe received a request to reset your SS Creation Jewellery account password.\n\nReset your password using this link (valid for 30 minutes):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— SS Creation Jewellery`;
  const html = `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; background: #FAF7F1; padding: 40px 32px;">
    <p style="letter-spacing: 3px; text-transform: uppercase; font-size: 12px; color: #A6873F; text-align:center; margin: 0 0 4px;">SS Creation</p>
    <h1 style="text-align:center; font-size: 22px; color: #1C1A17; margin: 0 0 28px;">Jewellery</h1>
    <h2 style="font-size: 18px; color: #1C1A17; margin-bottom: 14px;">Reset Your Password</h2>
    <p style="font-size: 14px; color: #4a4640; line-height: 1.6;">
      We received a request to reset your SS Creation Jewellery account password.
      Click the button below to create a new password. This link is valid for 30 minutes.
    </p>
    <div style="text-align:center; margin: 32px 0;">
      <a href="${resetUrl}" style="background:#C9A857; color:#1C1A17; text-decoration:none; padding: 14px 32px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="font-size: 12px; color: #8a857c; line-height: 1.6;">
      If you did not request this, you can safely ignore this email — your password will remain unchanged.
    </p>
  </div>`;
  return { subject, text, html };
}
