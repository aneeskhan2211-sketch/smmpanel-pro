import type { Order, OrderStatus } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    serviceId: "svc-ig-followers",
    serviceName: "Instagram Followers – High Quality",
    link: "https://instagram.com/johndoe_official",
    quantity: 5000,
    charge: 4.5,
    startCount: 12340,
    remains: 0,
    status: "completed",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 44,
  },
  {
    id: "ORD-002",
    serviceId: "svc-yt-views",
    serviceName: "YouTube Views – Real Traffic",
    link: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    quantity: 10000,
    charge: 8.0,
    startCount: 45000,
    remains: 3200,
    status: "processing",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "ORD-003",
    serviceId: "svc-tt-likes",
    serviceName: "TikTok Likes – Fast Delivery",
    link: "https://tiktok.com/@creativecreator/video/7123456789",
    quantity: 2000,
    charge: 1.8,
    startCount: 890,
    remains: 2000,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 45,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: "ORD-004",
    serviceId: "svc-tw-followers",
    serviceName: "Twitter / X Followers – Premium",
    link: "https://twitter.com/marketingpro",
    quantity: 1000,
    charge: 2.25,
    startCount: 5600,
    remains: 0,
    status: "refunded",
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 68,
  },
  {
    id: "ORD-005",
    serviceId: "svc-fb-likes",
    serviceName: "Facebook Page Likes",
    link: "https://facebook.com/mybrandpage",
    quantity: 3000,
    charge: 3.6,
    startCount: 1200,
    remains: 0,
    status: "completed",
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    updatedAt: Date.now() - 1000 * 60 * 60 * 90,
  },
  {
    id: "ORD-006",
    serviceId: "svc-ig-reels",
    serviceName: "Instagram Reels Views",
    link: "https://instagram.com/reel/AbCdEfGhIjK",
    quantity: 25000,
    charge: 5.5,
    startCount: 340,
    remains: 25000,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 20,
    updatedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "ORD-007",
    serviceId: "svc-tg-members",
    serviceName: "Telegram Channel Members",
    link: "https://t.me/techinsiders",
    quantity: 500,
    charge: 1.2,
    startCount: 1880,
    remains: 0,
    status: "partial",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: "ORD-008",
    serviceId: "svc-yt-subs",
    serviceName: "YouTube Subscribers – Stable",
    link: "https://youtube.com/c/techreviewchannel",
    quantity: 200,
    charge: 6.0,
    startCount: 12400,
    remains: 80,
    status: "active",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

// ─── Platform helpers ─────────────────────────────────────────────────────────
export function getPlatformFromLink(link: string): string {
  if (link.includes("instagram")) return "instagram";
  if (link.includes("youtube")) return "youtube";
  if (link.includes("tiktok")) return "tiktok";
  if (link.includes("twitter") || link.includes("x.com")) return "twitter";
  if (link.includes("facebook")) return "facebook";
  if (link.includes("t.me") || link.includes("telegram")) return "telegram";
  return "website";
}

// ─── Status config ────────────────────────────────────────────────────────────
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  pulse: boolean;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400/30",
    pulse: true,
  },
  processing: {
    label: "Processing",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/30",
    pulse: true,
  },
  active: {
    label: "Active",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10 border-sky-400/30",
    pulse: true,
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bgColor: "bg-green-400/10 border-green-400/30",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/30",
    pulse: false,
  },
  partial: {
    label: "Partial",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10 border-orange-400/30",
    pulse: false,
  },
  refunded: {
    label: "Refunded",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 border-purple-400/30",
    pulse: false,
  },
};

// ─── Hook: useOrders ──────────────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      // Simulate network call
      await new Promise((r) => setTimeout(r, 600));
      setOrders(MOCK_ORDERS);
      setError(null);
    } catch {
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

// ─── Hook: useOrderById ───────────────────────────────────────────────────────
export function useOrderById(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const found = MOCK_ORDERS.find((o) => o.id === orderId) ?? null;
    const timer = setTimeout(() => {
      setOrder(found);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [orderId]);

  return { order, isLoading };
}

// ─── Hook: useActiveOrdersPolling ─────────────────────────────────────────────
export function useActiveOrdersPolling(
  orders: Order[],
  onUpdate: (updated: Order[]) => void,
  intervalMs = 5000,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasActive = orders.some(
    (o) =>
      o.status === "pending" ||
      o.status === "processing" ||
      o.status === "active",
  );

  useEffect(() => {
    if (!hasActive) return;

    intervalRef.current = setInterval(async () => {
      // Simulate status progression
      onUpdate(
        orders.map((o) => {
          if (o.status === "processing" && Math.random() < 0.15) {
            return {
              ...o,
              status: "completed" as OrderStatus,
              remains: 0,
              updatedAt: Date.now(),
            };
          }
          return o;
        }),
      );
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasActive, intervalMs, onUpdate, orders]);
}
