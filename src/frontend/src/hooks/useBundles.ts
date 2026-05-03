import { createActor } from "@/backend";
import type { BundlePublic } from "@/backend";
import { useCurrencyStore } from "@/store/currencyStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

// ─── Mock Bundles ─────────────────────────────────────────────────────────────

const MOCK_BUNDLES: BundlePublic[] = [
  {
    id: BigInt(1),
    name: "Starter Growth Pack",
    description:
      "Perfect entry point — followers, likes, and views in one affordable bundle to kick-start your social presence.",
    services: [
      { serviceId: BigInt(1), quantity: BigInt(1000) },
      { serviceId: BigInt(2), quantity: BigInt(500) },
      { serviceId: BigInt(3), quantity: BigInt(5000) },
    ],
    originalPrice: BigInt(899),
    discountedPrice: BigInt(599),
    estimatedDeliveryHours: BigInt(72),
    hasPremiumUpgrade: true,
    badge: "",
    imageEmoji: "🚀",
    isActive: true,
  },
  {
    id: BigInt(2),
    name: "Reels Viral Pack",
    description:
      "Go viral on Reels — explosive views, likes, saves, and shares in one high-impact bundle.",
    services: [
      { serviceId: BigInt(4), quantity: BigInt(10000) },
      { serviceId: BigInt(5), quantity: BigInt(1000) },
      { serviceId: BigInt(6), quantity: BigInt(500) },
      { serviceId: BigInt(7), quantity: BigInt(300) },
    ],
    originalPrice: BigInt(1299),
    discountedPrice: BigInt(899),
    estimatedDeliveryHours: BigInt(48),
    hasPremiumUpgrade: true,
    badge: "🔥 Most Popular",
    imageEmoji: "🎬",
    isActive: true,
  },
  {
    id: BigInt(3),
    name: "YouTube Growth Pack",
    description:
      "Accelerate your YouTube channel — real views, likes, and subscribers that improve your channel's ranking.",
    services: [
      { serviceId: BigInt(8), quantity: BigInt(5000) },
      { serviceId: BigInt(9), quantity: BigInt(500) },
      { serviceId: BigInt(10), quantity: BigInt(200) },
    ],
    originalPrice: BigInt(1499),
    discountedPrice: BigInt(999),
    estimatedDeliveryHours: BigInt(96),
    hasPremiumUpgrade: true,
    badge: "",
    imageEmoji: "▶️",
    isActive: true,
  },
  {
    id: BigInt(4),
    name: "Business Boost Pack",
    description:
      "Grow your local business online — website traffic, Google reviews, and social media engagement combined.",
    services: [
      { serviceId: BigInt(11), quantity: BigInt(10000) },
      { serviceId: BigInt(12), quantity: BigInt(10) },
      { serviceId: BigInt(13), quantity: BigInt(2000) },
    ],
    originalPrice: BigInt(2499),
    discountedPrice: BigInt(1699),
    estimatedDeliveryHours: BigInt(120),
    hasPremiumUpgrade: true,
    badge: "💼 Business",
    imageEmoji: "📈",
    isActive: true,
  },
  {
    id: BigInt(5),
    name: "Premium Brand Pack",
    description:
      "For creators and brands who want the complete package — followers, comments, profile visits, and content strategy.",
    services: [
      { serviceId: BigInt(1), quantity: BigInt(2000) },
      { serviceId: BigInt(14), quantity: BigInt(50) },
      { serviceId: BigInt(15), quantity: BigInt(2000) },
      { serviceId: BigInt(16), quantity: BigInt(5) },
    ],
    originalPrice: BigInt(3499),
    discountedPrice: BigInt(2399),
    estimatedDeliveryHours: BigInt(144),
    hasPremiumUpgrade: true,
    badge: "💎 Premium",
    imageEmoji: "👑",
    isActive: true,
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBundles() {
  const { actor, isFetching } = useActor(createActor);
  const { formatAmount, convertFromINR } = useCurrencyStore();

  const query = useQuery({
    queryKey: ["bundles"],
    queryFn: async () => {
      if (!actor) return MOCK_BUNDLES;
      const result = await actor.listBundles();
      return result.length > 0 ? result : MOCK_BUNDLES;
    },
    enabled: !isFetching,
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_BUNDLES,
  });

  const bundlesWithPrices = (query.data ?? MOCK_BUNDLES).map((bundle) => ({
    ...bundle,
    displayOriginalPrice: formatAmount(Number(bundle.originalPrice)),
    displayDiscountedPrice: formatAmount(Number(bundle.discountedPrice)),
    convertedOriginal: convertFromINR(Number(bundle.originalPrice)),
    convertedDiscounted: convertFromINR(Number(bundle.discountedPrice)),
    savingsPercent: Math.round(
      ((Number(bundle.originalPrice) - Number(bundle.discountedPrice)) /
        Number(bundle.originalPrice)) *
        100,
    ),
  }));

  return { ...query, bundles: bundlesWithPrices };
}
