"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import FacetMark from "./FacetMark";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Premium dark-navy slides (no stock photography used — see
// SLIDE_NOTES below) built from CSS gradients + the brand's facet mark,
// matching the moody, editorial direction requested without sourcing
// or fabricating "product photography" that isn't actually yours.
// Replace the `bg` gradient on any slide with a real photograph anytime
// by publishing a banner from Admin → Banners — that always takes over
// automatically (see the branch below).
const STATIC_SLIDES = [
  {
    key: "timeless",
    eyebrow: "Timeless Elegance",
    title: "Exquisite Jewellery\nfor Every Moment",
    copy: "Discover handcrafted gold, diamond and fine jewellery that celebrates your unique story.",
    cta: "Explore Collection",
    href: "/shop",
    bg: "bg-[radial-gradient(circle_at_75%_30%,#1B2A4A_0%,#0F1B33_55%,#0A1224_100%)]",
  },
  {
    key: "diamond",
    eyebrow: "The Diamond Edit",
    title: "Diamond Collection",
    copy: "Brilliance that lasts forever — IGI-certified solitaires and halo settings.",
    cta: "Shop Diamonds",
    href: "/shop?collection=diamond-collection",
    bg: "bg-[radial-gradient(circle_at_25%_70%,#1B2A4A_0%,#0F1B33_55%,#0A1224_100%)]",
  },
  {
    key: "bridal",
    eyebrow: "For Your Big Day",
    title: "Bridal Collection",
    copy: "Celebrate your forever with layered necklaces, statement bangles and rings built for the aisle.",
    cta: "Shop Bridal",
    href: "/shop?collection=bridal-collection",
    bg: "bg-[radial-gradient(circle_at_70%_75%,#6E1E2E_0%,#1B2A4A_45%,#0A1224_100%)]",
  },
  {
    key: "gold",
    eyebrow: "Heritage Gold",
    title: "Gold Collection",
    copy: "Crafted in gold, designed for you — BIS hallmarked 18K & 22K, handcrafted in traditional motifs.",
    cta: "Shop Gold",
    href: "/shop?collection=gold-collection",
    bg: "bg-[radial-gradient(circle_at_30%_25%,#A6873F_0%,#1B2A4A_50%,#0A1224_100%)]",
  },
  {
    key: "mens",
    eyebrow: "Men's Collection",
    title: "Bold. Refined. Timeless.",
    copy: "Signet rings, chains and kadas crafted for the modern man.",
    cta: "Shop Men's Collection",
    href: "/shop?gender=MEN",
    bg: "bg-[radial-gradient(circle_at_60%_40%,#1B2A4A_0%,#0A1224_60%,#0A1224_100%)]",
  },
];

export interface DbBanner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

// When the admin has published active banners (/admin/banners), those
// take over the homepage hero with real photography. With none published
// yet, the styled gradient slides above keep showing so the homepage
// never renders empty or relies on stock imagery.
export default function HeroSlider({ banners }: { banners?: DbBanner[] }) {
  if (banners && banners.length > 0) {
    return (
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
        pagination={{ clickable: true, el: ".hero-dots" }}
        loop
        className="w-full relative group"
      >
        {banners.map((b) => (
          <SwiperSlide key={b.id}>
            <div
              className="h-[62vh] min-h-[440px] flex items-center bg-cover bg-center relative"
              style={{ backgroundImage: `url(${b.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-navy/40" />
              <div className="max-w-content mx-auto px-6 md:px-12 w-full relative">
                <div className="max-w-md animate-fadeUp text-ivory">
                  <h1 className="text-4xl md:text-6xl mb-4 leading-[1.05]">{b.title}</h1>
                  {b.subtitle && <p className="mb-7 text-base text-ivory/90">{b.subtitle}</p>}
                  {b.linkUrl && (
                    <Link href={b.linkUrl} className="btn-primary">
                      Shop Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <HeroArrows />
      </Swiper>
    );
  }

  return (
    <Swiper
      modules={[Autoplay, EffectFade, Navigation, Pagination]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
      pagination={{ clickable: true, el: ".hero-dots" }}
      loop
      className="w-full relative group"
    >
      {STATIC_SLIDES.map((b) => (
        <SwiperSlide key={b.key}>
          <div className={`${b.bg} h-[62vh] min-h-[440px] flex items-center relative overflow-hidden`}>
            <FacetMark className="absolute top-8 right-8 md:top-10 md:right-14 w-14 h-9 opacity-70" />
            <div className="max-w-content mx-auto px-6 md:px-12 w-full relative">
              <div className="max-w-lg animate-fadeUp text-ivory">
                <p className="flex items-center gap-3 text-champagne text-xs uppercase tracking-wide2 mb-4">
                  <span className="w-8 h-px bg-champagne/60" />
                  {b.eyebrow}
                  <span className="w-8 h-px bg-champagne/60" />
                </p>
                <h1 className="text-4xl md:text-6xl mb-4 leading-[1.05] whitespace-pre-line font-display">
                  {b.title}
                </h1>
                <p className="text-ivory/70 mb-7 text-base max-w-sm">{b.copy}</p>
                <Link
                  href={b.href}
                  className="inline-flex items-center gap-2 bg-champagne text-navy px-7 py-3 text-xs uppercase tracking-wide2 font-semibold hover:bg-champagne-light transition-colors"
                >
                  {b.cta} →
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <HeroArrows />
    </Swiper>
  );
}

function HeroArrows() {
  return (
    <>
      <button
        aria-label="Previous slide"
        className="hero-prev absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center text-ivory/80 hover:text-champagne transition-colors"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        aria-label="Next slide"
        className="hero-next absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center text-ivory/80 hover:text-champagne transition-colors"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div className="hero-dots absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2" />
    </>
  );
}
