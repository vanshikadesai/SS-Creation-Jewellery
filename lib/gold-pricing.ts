// Pure functions only — no server-only imports — so this same module
// can compute a live preview inside the "use client" ProductForm and
// be the authoritative calculation used server-side in the product and
// gold-rate API routes. One formula, one place.

export const GOLD_PURITY_FACTORS: Record<string, number> = {
  "24K": 1,
  "22K": 0.916,
  "18K": 0.75,
  "14K": 0.583,
  "10K": 0.417,
  "9K": 0.375,
};

/** Accepts "18K", "18k", "18 K", or a bare number of karats like "20". */
export function purityFactor(goldPurity: string | null | undefined): number | null {
  if (!goldPurity) return null;
  const key = goldPurity.trim().toUpperCase();
  if (GOLD_PURITY_FACTORS[key]) return GOLD_PURITY_FACTORS[key];
  const match = key.match(/(\d+(\.\d+)?)\s*K?/);
  if (match) {
    const karats = Number(match[1]);
    if (karats > 0 && karats <= 24) return Math.round((karats / 24) * 1000) / 1000;
  }
  return null;
}

export type MakingChargeType = "PERCENTAGE" | "FLAT";

export interface GoldPricingInput {
  goldWeightGrams: number | null | undefined;
  goldPurity: string | null | undefined;
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
  otherChargesAmount: number;
  ratePerGram24k: number;
}

export interface GoldPricingResult {
  metalValue: number;
  makingCharge: number;
  total: number;
}

/**
 * Returns null when the product doesn't have enough gold data to price
 * automatically (no weight, or an unrecognized purity) — callers should
 * treat that as "can't auto-price this one, ask the admin to fix the
 * gold weight/purity or turn auto-pricing off for it."
 */
export function computeGoldPrice(input: GoldPricingInput): GoldPricingResult | null {
  const factor = purityFactor(input.goldPurity);
  if (!input.goldWeightGrams || input.goldWeightGrams <= 0 || factor === null) return null;
  if (!input.ratePerGram24k || input.ratePerGram24k <= 0) return null;

  const metalValue = input.goldWeightGrams * input.ratePerGram24k * factor;
  const makingCharge =
    input.makingChargeType === "PERCENTAGE"
      ? metalValue * ((input.makingChargeValue || 0) / 100)
      : input.makingChargeValue || 0;
  const total = metalValue + makingCharge + (input.otherChargesAmount || 0);

  return {
    metalValue: Math.round(metalValue * 100) / 100,
    makingCharge: Math.round(makingCharge * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
