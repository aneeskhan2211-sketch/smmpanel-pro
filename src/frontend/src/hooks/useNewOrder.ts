import type { Service, ServiceCategory } from "@/types";
import { useCallback, useMemo, useState } from "react";

// ─── Mock service data (replace with backend hook when available) ─────────────
const MOCK_SERVICES: Service[] = [
  {
    id: "ig-followers-1",
    name: "Instagram Followers – Real & Active",
    category: "instagram",
    pricePerThousand: 85,
    minOrder: 100,
    maxOrder: 50000,
    deliveryTime: "1-6 hours",
    refill: true,
    rating: 97,
    description:
      "High-quality real-looking followers with 30-day refill guarantee.",
    speed: "fast",
  },
  {
    id: "ig-likes-1",
    name: "Instagram Post Likes – Premium",
    category: "instagram",
    pricePerThousand: 35,
    minOrder: 50,
    maxOrder: 100000,
    deliveryTime: "15-30 min",
    refill: false,
    rating: 99,
    description: "Instant delivery, no password required.",
    speed: "fast",
  },
  {
    id: "ig-reels-1",
    name: "Instagram Reels Views",
    category: "instagram",
    pricePerThousand: 18,
    minOrder: 500,
    maxOrder: 5000000,
    deliveryTime: "0-5 min",
    refill: false,
    rating: 98,
    description: "Boost reel visibility with lightning-fast view delivery.",
    speed: "fast",
  },
  {
    id: "yt-subs-1",
    name: "YouTube Subscribers – Stable",
    category: "youtube",
    pricePerThousand: 320,
    minOrder: 100,
    maxOrder: 20000,
    deliveryTime: "12-48 hours",
    refill: true,
    rating: 95,
    description: "Non-drop subscribers with 60-day refill protection.",
    speed: "medium",
  },
  {
    id: "yt-views-1",
    name: "YouTube Views – HQ Retention",
    category: "youtube",
    pricePerThousand: 22,
    minOrder: 1000,
    maxOrder: 10000000,
    deliveryTime: "1-4 hours",
    refill: false,
    rating: 96,
    description: "60%+ retention rate. Safe for monetized channels.",
    speed: "fast",
  },
  {
    id: "tt-followers-1",
    name: "TikTok Followers – Real",
    category: "tiktok",
    pricePerThousand: 95,
    minOrder: 100,
    maxOrder: 30000,
    deliveryTime: "2-12 hours",
    refill: true,
    rating: 94,
    description: "Organic-looking followers for TikTok growth.",
    speed: "medium",
  },
  {
    id: "tt-views-1",
    name: "TikTok Video Views",
    category: "tiktok",
    pricePerThousand: 8,
    minOrder: 1000,
    maxOrder: 50000000,
    deliveryTime: "0-10 min",
    refill: false,
    rating: 99,
    description: "Instant viral boost. Suitable for all videos.",
    speed: "fast",
  },
  {
    id: "tw-followers-1",
    name: "Twitter (X) Followers – Active",
    category: "twitter",
    pricePerThousand: 110,
    minOrder: 100,
    maxOrder: 25000,
    deliveryTime: "6-24 hours",
    refill: false,
    rating: 93,
    description: "Real-looking followers to build your Twitter presence.",
    speed: "medium",
  },
  {
    id: "fb-likes-1",
    name: "Facebook Page Likes",
    category: "facebook",
    pricePerThousand: 75,
    minOrder: 100,
    maxOrder: 50000,
    deliveryTime: "6-24 hours",
    refill: false,
    rating: 91,
    description: "Page likes from real-looking accounts.",
    speed: "medium",
  },
  {
    id: "tg-members-1",
    name: "Telegram Channel Members",
    category: "telegram",
    pricePerThousand: 55,
    minOrder: 100,
    maxOrder: 100000,
    deliveryTime: "1-6 hours",
    refill: false,
    rating: 92,
    description: "Grow your Telegram channel fast.",
    speed: "fast",
  },
  {
    id: "web-traffic-1",
    name: "Website Traffic – Real Visitors",
    category: "website",
    pricePerThousand: 12,
    minOrder: 1000,
    maxOrder: 10000000,
    deliveryTime: "12-72 hours",
    refill: false,
    rating: 88,
    description: "Geo-targeted real visitor traffic with low bounce rate.",
    speed: "slow",
  },
];

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  twitter: "Twitter (X)",
  telegram: "Telegram",
  website: "Website Traffic",
  business: "Business Growth",
  ai: "AI Tools",
};

export function useNewOrder() {
  const services = MOCK_SERVICES;
  const categoryLabels = CATEGORY_LABELS;

  const servicesByCategory = useMemo(() => {
    const map = new Map<ServiceCategory, Service[]>();
    for (const svc of services) {
      const existing = map.get(svc.category) ?? [];
      map.set(svc.category, [...existing, svc]);
    }
    return map;
  }, [services]);

  const getService = useCallback(
    (id: string) => services.find((s) => s.id === id) ?? null,
    [services],
  );

  const calcPrice = useCallback(
    (service: Service | null, qty: number): number => {
      if (!service || qty <= 0) return 0;
      return (service.pricePerThousand / 1000) * qty;
    },
    [],
  );

  const getSpeedColor = (speed: Service["speed"]) => {
    if (speed === "fast") return "text-accent";
    if (speed === "medium") return "text-yellow-400";
    return "text-muted-foreground";
  };

  const getSpeedLabel = (speed: Service["speed"]) => {
    if (speed === "fast") return "Fast";
    if (speed === "medium") return "Medium";
    return "Slow";
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const placeOrder = useCallback(
    async (
      _serviceId: string,
      _link: string,
      _quantity: number,
    ): Promise<boolean> => {
      setIsPlacingOrder(true);
      // Simulate async order placement (replace with actor call)
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setIsPlacingOrder(false);
      return true;
    },
    [],
  );

  return {
    services,
    servicesByCategory,
    categoryLabels,
    getService,
    calcPrice,
    getSpeedColor,
    getSpeedLabel,
    isPlacingOrder,
    placeOrder,
  };
}
