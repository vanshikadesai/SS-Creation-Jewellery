import type { Config } from "tailwindcss";

// SS CREATION JEWELLERY — Design tokens
// Palette:
//   ivory      #FAF7F1  — primary background
//   charcoal   #1C1A17  — primary text / near-black
//   champagne  #C9A857  — gold accent (CTAs, prices, highlights)
//   emerald    #1F3B2C  — secondary accent (bridal/festive collections)
//   rosedust   #C79C93  — tertiary accent (feminine touches, tags)
//   navy       #0F1B33  — premium dark backgrounds (header, hero, product cards)
//   burgundy   #6E1E2E  — subtle accent (sale badges, rare highlights)
// Type:
//   display — "Cormorant Garamond" (high-contrast luxury serif, headlines)
//   body    — "Manrope" (clean geometric sans, UI + body copy)

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF7F1",
        charcoal: "#1C1A17",
        champagne: {
          DEFAULT: "#C9A857",
          light: "#E4CE8F",
          dark: "#A6873F",
        },
        emerald: {
          DEFAULT: "#1F3B2C",
          light: "#2E5641",
        },
        rosedust: {
          DEFAULT: "#C79C93",
          light: "#E3C9C2",
        },
        navy: {
          DEFAULT: "#0F1B33",
          light: "#1B2A4A",
          dark: "#0A1224",
        },
        burgundy: {
          DEFAULT: "#6E1E2E",
          light: "#8A2C3F",
        },
        border: "#E8E1D4",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.18em",
      },
      maxWidth: {
        content: "1440px",
      },
      boxShadow: {
        card: "0 2px 24px rgba(28,26,23,0.06)",
        lift: "0 12px 32px rgba(28,26,23,0.12)",
      },
      keyframes: {
        facetSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        facetSpin: "facetSpin 8s linear infinite",
        fadeUp: "fadeUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
