import { createActor } from "@/backend";
import type { ChartDataPoint, DashboardStats } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      if (!actor)
        return {
          walletBalance: 0,
          totalOrders: 0,
          activeOrders: 0,
          completedOrders: 0,
        };
      const [balance, stats] = await Promise.all([
        actor.getMyBalance(),
        actor.getMyStats(),
      ]);
      return {
        walletBalance: Number(balance) / 100,
        totalOrders: Number(stats.totalOrders),
        activeOrders: Number(stats.activeOrders),
        completedOrders: Number(stats.completedOrders),
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useDailySpend() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ChartDataPoint[]>({
    queryKey: ["dashboard", "daily-spend"],
    queryFn: async () => {
      if (!actor) return MOCK_DAILY_SPEND;
      const txs = await actor.getMyTransactions();
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const now = Date.now();
      const buckets = days.map((label, i) => {
        const dayStart = now - (6 - i) * 86_400_000;
        const dayEnd = dayStart + 86_400_000;
        const total = txs
          .filter(
            (t) =>
              t.txType.toString() === "debit" &&
              Number(t.createdAt) / 1_000_000 >= dayStart &&
              Number(t.createdAt) / 1_000_000 < dayEnd,
          )
          .reduce((s, t) => s + Number(t.amount) / 100, 0);
        return { label, value: total };
      });
      const hasData = buckets.some((b) => b.value > 0);
      return hasData ? buckets : MOCK_DAILY_SPEND;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useOrderActivity() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<ChartDataPoint[]>({
    queryKey: ["dashboard", "order-activity"],
    queryFn: async () => {
      if (!actor) return MOCK_ORDER_ACTIVITY;
      const orders = await actor.getMyOrders();
      const labels = Array.from({ length: 8 }, (_, i) => String(i * 3));
      const now = Date.now();
      const buckets = labels.map((label, i) => {
        const segStart = now - (7 - i) * 3 * 86_400_000;
        const segEnd = segStart + 3 * 86_400_000;
        const count = orders.filter(
          (o) =>
            Number(o.createdAt) / 1_000_000 >= segStart &&
            Number(o.createdAt) / 1_000_000 < segEnd,
        ).length;
        return { label, value: count };
      });
      const hasData = buckets.some((b) => b.value > 0);
      return hasData ? buckets : MOCK_ORDER_ACTIVITY;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Mock fallback data (shown while actor loads or no data yet) ──────────────
const MOCK_DAILY_SPEND: ChartDataPoint[] = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 9 },
  { label: "Wed", value: 18 },
  { label: "Thu", value: 24 },
  { label: "Fri", value: 20 },
  { label: "Sat", value: 31 },
  { label: "Sun", value: 38 },
];

const MOCK_ORDER_ACTIVITY: ChartDataPoint[] = [
  { label: "0", value: 18 },
  { label: "3", value: 32 },
  { label: "6", value: 28 },
  { label: "9", value: 42 },
  { label: "12", value: 38 },
  { label: "15", value: 55 },
  { label: "18", value: 62 },
  { label: "21", value: 70 },
];
