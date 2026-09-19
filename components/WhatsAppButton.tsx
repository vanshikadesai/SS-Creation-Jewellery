"use client";

import { usePathname } from "next/navigation";
import { whatsAppLink } from "@/lib/site-config";

export default function WhatsAppButton() {
  const pathname = usePathname();
  // The floating contact button is a storefront/customer-facing
  // affordance — it has no place inside the admin CMS, so it hides
  // itself there rather than the admin layout needing to know about it.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={whatsAppLink("Hi SS Creation, I'd like to know more about your jewellery.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] text-white shadow-lift flex items-center justify-center hover:scale-105 transition-transform"
    >
      {/* Inline WhatsApp glyph so no extra icon-set dependency is added */}
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.31.638 4.47 1.746 6.315L4 29l7.86-1.706A11.93 11.93 0 0016 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3zm0 21.7a9.66 9.66 0 01-4.93-1.35l-.354-.21-4.664 1.012 1.036-4.542-.23-.37A9.66 9.66 0 016.3 15c0-5.352 4.35-9.7 9.701-9.7 5.352 0 9.7 4.348 9.7 9.7 0 5.352-4.348 9.7-9.7 9.7zm5.316-7.267c-.29-.146-1.718-.848-1.984-.945-.267-.097-.461-.146-.655.146-.194.29-.752.945-.922 1.14-.17.194-.34.218-.63.073-.29-.146-1.225-.451-2.334-1.44-.863-.77-1.446-1.72-1.616-2.01-.17-.29-.018-.447.128-.592.13-.13.29-.34.436-.51.146-.17.194-.29.29-.485.097-.194.049-.364-.024-.51-.073-.146-.655-1.577-.898-2.16-.237-.567-.478-.49-.655-.5l-.558-.01c-.194 0-.51.073-.777.364-.267.29-1.018.995-1.018 2.427s1.042 2.816 1.187 3.01c.146.194 2.05 3.13 4.966 4.39.694.3 1.235.48 1.657.614.696.222 1.33.19 1.83.115.558-.083 1.718-.702 1.96-1.38.243-.68.243-1.262.17-1.38-.073-.12-.267-.194-.558-.34z" />
      </svg>
    </a>
  );
}
