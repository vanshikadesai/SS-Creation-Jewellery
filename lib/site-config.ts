// Single source of truth for values that appear in multiple places
// across the site (Footer, Contact page, WhatsApp button). The phone
// number below matches what already appears on /contact and in the
// Footer — nothing new was invented; this just centralizes the existing
// number instead of leaving it duplicated in three places.
//
// To change the number, either edit WHATSAPP_NUMBER_DEFAULT below or set
// NEXT_PUBLIC_WHATSAPP_NUMBER in your .env (digits only, with country
// code, no "+" or spaces — e.g. "919930701983").

const WHATSAPP_NUMBER_DEFAULT = "919930701983"; // +91 99307 01983

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || WHATSAPP_NUMBER_DEFAULT;

export const WHATSAPP_DISPLAY = "+91 99307 01983";

export function whatsAppLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
