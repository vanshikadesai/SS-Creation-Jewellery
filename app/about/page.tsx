import FacetMark from "@/components/FacetMark";
import { Gem, ShieldCheck, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Us | SS Creation Jewellery",
  description:
    "The story, craftsmanship and certification standards behind SS Creation Jewellery.",
};

const PILLARS = [
  {
    icon: Gem,
    title: "Master Craftsmanship",
    body: "Every piece is hand-finished by artisans trained in traditional Indian jewellery-making techniques, refined over generations.",
  },
  {
    icon: ShieldCheck,
    title: "Certified Quality",
    body: "Our diamonds and gold are sourced and certified to recognised industry standards, so every purchase is backed by verifiable quality.",
  },
  {
    icon: Award,
    title: "Trusted by Customers",
    body: "From everyday elegance to bridal collections, customers return to SS Creation for pieces that are made to be treasured for years.",
  },
  {
    icon: Sparkles,
    title: "Timeless Design",
    body: "Our design language balances classic Indian motifs with a refined, modern silhouette — jewellery that feels as at home today as it will decades from now.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-content mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <FacetMark className="w-12 h-8 mx-auto mb-6" />
        <p className="eyebrow mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl mb-6 max-w-2xl mx-auto">
          Jewellery Crafted for Life&apos;s Finest Moments
        </h1>
        <p className="text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
          SS Creation Jewellery was founded on a simple belief: fine jewellery should be
          as trustworthy as it is beautiful. From our first pieces to our latest bridal
          and diamond collections, every design passes through the hands of skilled
          craftspeople who take pride in getting every facet, setting and finish right.
        </p>
      </section>

      <section className="bg-[#F5F1E8] py-16 md:py-20">
        <div className="max-w-content mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto mb-4 text-champagne-dark" size={28} strokeWidth={1.5} />
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-content mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow mb-3">Craftsmanship</p>
          <h2 className="text-3xl md:text-4xl mb-5">
            Where Tradition Meets Precision
          </h2>
          <p className="text-charcoal/70 leading-relaxed mb-4">
            Each piece begins as a hand sketch before it is shaped in gold and set with
            stones. Our craftspeople combine time-honoured techniques — hand engraving,
            filigree work and traditional stone-setting — with modern quality checks at
            every stage of production.
          </p>
          <p className="text-charcoal/70 leading-relaxed">
            We work only with gold of verified purity and diamonds that meet clear
            certification standards, so the quality you see is the quality you receive.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Diamond Certification</p>
          <h2 className="text-3xl md:text-4xl mb-5">
            Quality You Can Verify
          </h2>
          <p className="text-charcoal/70 leading-relaxed mb-4">
            Every diamond piece in our diamond and bridal collections is accompanied by
            certification details on the product page — carat weight, clarity grade and
            certifying authority — so you always know exactly what you&apos;re buying.
          </p>
          <p className="text-charcoal/70 leading-relaxed">
            It&apos;s this transparency, paired with genuine craftsmanship, that has
            earned SS Creation the trust of customers across generations of celebrations.
          </p>
        </div>
      </section>

      <section className="bg-charcoal text-ivory py-16 md:py-20 text-center">
        <div className="max-w-content mx-auto px-4 md:px-8">
          <FacetMark className="w-10 h-6 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl mb-4">Why SS Creation</h2>
          <p className="text-ivory/70 max-w-2xl mx-auto leading-relaxed">
            Because jewellery isn&apos;t just an accessory — it&apos;s a keepsake of a
            moment. We craft every piece to be worn, loved and eventually passed down,
            backed by honest pricing, real certification, and a promise of quality that
            never wavers.
          </p>
        </div>
      </section>
    </div>
  );
}
