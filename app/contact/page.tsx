import FacetMark from "@/components/FacetMark";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/lib/site-config";

export const metadata = {
  title: "Contact Us | SS Creation Jewellery",
  description: "Get in touch with the SS Creation Jewellery team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center mb-14">
        <FacetMark className="w-10 h-6 mx-auto mb-4" />
        <p className="eyebrow mb-2">Get in Touch</p>
        <h1 className="text-3xl md:text-4xl">We&apos;d Love to Hear From You</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14">
        <ContactForm />

        <div className="space-y-8">
          <div>
            <p className="eyebrow mb-3">Contact Information</p>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail size={17} className="text-champagne-dark mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-charcoal/60">support@sscreationjewellery.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={17} className="text-champagne-dark mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-charcoal/60">{WHATSAPP_DISPLAY}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={17} className="text-champagne-dark mt-0.5" />
                <div>
                  <p className="font-medium">Studio Location</p>
                  <p className="text-charcoal/60">
                    1108, Kosha Complex, Malad East, Mumbai - 400097
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Business Hours</p>
            <div className="flex items-start gap-3 text-sm">
              <Clock size={17} className="text-champagne-dark mt-0.5" />
              <div className="text-charcoal/60">
                <p>Monday – Saturday: 10:00 AM – 7:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
