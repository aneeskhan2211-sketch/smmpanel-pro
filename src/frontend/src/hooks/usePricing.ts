import type { ServicePublic, TierName } from "@/backend";
import { useCurrencyStore } from "@/store/currencyStore";

export interface PricingResult {
  tierPrice: number; // in INR (bigint converted)
  displayPrice: string; // formatted with currency symbol
  pricePerThousand: string; // formatted p/1000
  deliveryHours: number;
  deliveryLabel: string;
  premiumBenefits: string[];
  walletRequired: string;
}

const TIER_MULTIPLIERS: Record<TierName, number> = {
  basic: 1.0,
  recommended: 1.25,
  premium: 1.875,
};

const PREMIUM_BENEFITS = [
  "High Retention",
  "Safer Growth",
  "Refill Included",
  "Priority Delivery",
  "Better Quality",
];

const RECOMMENDED_BENEFITS = [
  "Good Retention",
  "Faster Support",
  "Refill Available",
  "Priority Queue",
];

export function usePricing(
  service: ServicePublic | null,
  tier: TierName,
  quantity: number,
) {
  const { formatAmount, convertFromINR } = useCurrencyStore();

  if (!service) {
    return null;
  }

  const basePriceINR = Number(service.pricePerThousand);
  const multiplier = TIER_MULTIPLIERS[tier];
  const tierPricePerThousandINR = basePriceINR * multiplier;
  const totalINR = (tierPricePerThousandINR / 1000) * quantity;

  const deliveryHours = Math.round(
    Number(service.deliveryTimeHours) *
      (tier === "premium" ? 1.5 : tier === "recommended" ? 1.2 : 1),
  );

  const deliveryLabel =
    deliveryHours < 24
      ? `${deliveryHours} hours`
      : `${Math.round(deliveryHours / 24)} days`;

  const premiumBenefits =
    tier === "premium"
      ? PREMIUM_BENEFITS
      : tier === "recommended"
        ? RECOMMENDED_BENEFITS
        : [];

  return {
    tierPrice: totalINR,
    displayPrice: formatAmount(totalINR),
    pricePerThousand: formatAmount(tierPricePerThousandINR),
    deliveryHours,
    deliveryLabel,
    premiumBenefits,
    walletRequired: formatAmount(totalINR),
    convertedTotal: convertFromINR(totalINR),
  } satisfies PricingResult & { convertedTotal: number };
}
