import { createActor } from "@/backend";
import type {
  AdminConfig,
  AdminDashboardStats,
  AdminFraudFilters,
  AdminLogFilters,
  AdminOrder,
  AdminOrderFilters,
  AdminUser,
  AdminUserFilters,
  FraudAlert,
  Provider,
  SystemLog,
} from "@/types/admin";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function useAdminDashboard() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      if (!actor) return mockDashboardStats();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetDashboardStats();
        return result as AdminDashboardStats;
      } catch {
        return mockDashboardStats();
      }
    },
    enabled: !isFetching,
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export function useAdminOrders(filters?: AdminOrderFilters) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminOrder[]>({
    queryKey: ["admin", "orders", filters],
    queryFn: async () => {
      if (!actor) return mockAdminOrders();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetAllOrders(filters ?? {});
        return result as AdminOrder[];
      } catch {
        return mockAdminOrders();
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminUpdateOrder() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      note: string;
      status: string;
    }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminUpdateOrderManual(params);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}

export function useAdminCancelOrder() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminCancelOrder(orderId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────
export function useAdminUsers(filters?: AdminUserFilters) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users", filters],
    queryFn: async () => {
      if (!actor) return mockAdminUsers();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetAllUsers(filters ?? {});
        return result as AdminUser[];
      } catch {
        return mockAdminUsers();
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminBanUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; reason: string }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminBanUser(params);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminAdjustWallet() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      amount: number;
      reason: string;
    }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminAdjustUserWallet(params);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// ─── Services ────────────────────────────────────────────────────────────────
export function useAdminServices() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (
          actor as unknown as ActorWithAdmin
        ).adminGetServiceStats();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminUpdateServiceVisibility() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { serviceId: string; visible: boolean }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminUpdateServiceVisibility(
        params,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

export function useAdminBatchPrices() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      updates: { serviceId: string; pricePerThousand: number }[],
    ) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminBatchUpdateServicePrices(
        updates,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
}

// ─── Providers ───────────────────────────────────────────────────────────────
export function useAdminProviders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Provider[]>({
    queryKey: ["admin", "providers"],
    queryFn: async () => {
      if (!actor) return mockProviders();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetProviders();
        return result as Provider[];
      } catch {
        return mockProviders();
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminAddProvider() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      provider: Omit<
        Provider,
        "id" | "successRate" | "failedLast24h" | "avgResponseMs"
      >,
    ) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminAddProvider(provider);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "providers"] }),
  });
}

export function useAdminUpdateProvider() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider: Partial<Provider> & { id: string }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminUpdateProvider(provider);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "providers"] }),
  });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
export function useAdminLogs(filters?: AdminLogFilters) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SystemLog[]>({
    queryKey: ["admin", "logs", filters],
    queryFn: async () => {
      if (!actor) return mockLogs();
      try {
        const result = await (actor as unknown as ActorWithAdmin).adminGetLogs(
          filters ?? {},
        );
        return result as SystemLog[];
      } catch {
        return mockLogs();
      }
    },
    enabled: !isFetching,
  });
}

// ─── Fraud Alerts ─────────────────────────────────────────────────────────────
export function useAdminFraudAlerts(filters?: AdminFraudFilters) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FraudAlert[]>({
    queryKey: ["admin", "fraud", filters],
    queryFn: async () => {
      if (!actor) return mockFraudAlerts();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetFraudAlerts(filters ?? {});
        return result as FraudAlert[];
      } catch {
        return mockFraudAlerts();
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminResolveFraud() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { alertId: string; action: string }) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminResolveFraudAlert(params);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fraud"] }),
  });
}

// ─── Config ───────────────────────────────────────────────────────────────────
export function useAdminConfig() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminConfig>({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      if (!actor) return mockConfig();
      try {
        const result = await (
          actor as unknown as ActorWithAdmin
        ).adminGetConfig();
        return result as AdminConfig;
      } catch {
        return mockConfig();
      }
    },
    enabled: !isFetching,
  });
}

export function useAdminUpdateConfig() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<AdminConfig>) => {
      if (!actor) return;
      await (actor as unknown as ActorWithAdmin).adminUpdateConfig(config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config"] }),
  });
}

// ─── Type helper ─────────────────────────────────────────────────────────────
type ActorWithAdmin = Record<string, (...args: unknown[]) => Promise<unknown>>;

// ─── Mock data ────────────────────────────────────────────────────────────────
function mockDashboardStats(): AdminDashboardStats {
  return {
    totalRevenue: 284750,
    totalOrders: 18432,
    totalUsers: 3847,
    totalActiveOrders: 412,
    avgOrderValue: 154,
    profitMarginPercent: 22.5,
    newUsersThisMonth: 342,
    subscriptionRevenue: { free: 0, pro: 18513, premium: 24868 },
    dailyRevenue: [
      8200, 9400, 7800, 11200, 10500, 12800, 9600, 11000, 13200, 10800, 9900,
      11500, 12100, 10300,
    ],
    dailyOrders: [
      420, 510, 380, 640, 590, 720, 480, 610, 740, 560, 490, 630, 680, 550,
    ],
    topServices: [
      {
        serviceId: "s1",
        name: "Instagram Followers – Real",
        revenue: 42800,
        unitsSold: 1280000,
      },
      {
        serviceId: "s2",
        name: "YouTube Views – Premium",
        revenue: 38400,
        unitsSold: 960000,
      },
      {
        serviceId: "s3",
        name: "TikTok Likes – Fast",
        revenue: 29600,
        unitsSold: 740000,
      },
      {
        serviceId: "s4",
        name: "Twitter Retweets",
        revenue: 22100,
        unitsSold: 552500,
      },
      {
        serviceId: "s5",
        name: "Facebook Page Likes",
        revenue: 18900,
        unitsSold: 472500,
      },
    ],
  };
}

function mockAdminOrders(): AdminOrder[] {
  const statuses = [
    "pending",
    "processing",
    "completed",
    "cancelled",
    "partial",
  ] as const;
  return Array.from({ length: 20 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    serviceId: `s${(i % 5) + 1}`,
    serviceName: [
      "Instagram Followers",
      "YouTube Views",
      "TikTok Likes",
      "Twitter Retweets",
      "Facebook Likes",
    ][i % 5],
    link: `https://instagram.com/user${i}`,
    quantity: (i + 1) * 500,
    charge: (((i + 1) * 500) / 1000) * 0.45,
    startCount: i * 100,
    remains: i % 3 === 0 ? 0 : 200,
    status: statuses[i % statuses.length],
    createdAt: Date.now() - i * 3600000,
    updatedAt: Date.now() - i * 1800000,
    userId: `user_${i % 10}`,
    adminNote: i % 4 === 0 ? "Manually reviewed" : "",
  }));
}

function mockAdminUsers(): AdminUser[] {
  const tiers = ["free", "pro", "premium"] as const;
  const statuses = ["active", "banned", "active"] as const;
  return Array.from({ length: 15 }, (_, i) => ({
    id: `user_${i}`,
    username: `customer_${i + 1}`,
    email: `user${i + 1}@example.com`,
    walletBalance: Math.random() * 500,
    role: "user" as const,
    createdAt: Date.now() - i * 86400000 * 30,
    totalSpend: Math.random() * 2000,
    subscriptionTier: tiers[i % 3],
    status: statuses[i % 3],
    lastLogin: Date.now() - i * 86400000,
  }));
}

function mockProviders(): Provider[] {
  return [
    {
      id: "p1",
      name: "SMMProvider Alpha",
      apiUrl: "https://api.smmprovider.com",
      apiKeyMasked: "sk_****xA3F",
      commissionPercent: 15,
      priority: 1,
      status: "active",
      successRate: 98.2,
      failedLast24h: 3,
      avgResponseMs: 420,
    },
    {
      id: "p2",
      name: "GrowFast API",
      apiUrl: "https://api.growfast.io",
      apiKeyMasked: "gf_****9K2D",
      commissionPercent: 18,
      priority: 2,
      status: "active",
      successRate: 96.7,
      failedLast24h: 8,
      avgResponseMs: 610,
    },
    {
      id: "p3",
      name: "SocialBoost Pro",
      apiUrl: "https://socialboost.net/api",
      apiKeyMasked: "sb_****mP5Q",
      commissionPercent: 20,
      priority: 3,
      status: "inactive",
      successRate: 91.3,
      failedLast24h: 24,
      avgResponseMs: 980,
    },
  ];
}

function mockLogs(): SystemLog[] {
  const actions = [
    "order.created",
    "user.login",
    "wallet.deposit",
    "order.cancelled",
    "user.banned",
    "config.updated",
  ];
  return Array.from({ length: 30 }, (_, i) => ({
    id: `log_${i}`,
    timestamp: Date.now() - i * 120000,
    action: actions[i % actions.length],
    actorId: i % 5 === 0 ? "admin_1" : `user_${i % 10}`,
    targetType: i % 2 === 0 ? "order" : "user",
    targetId: `target_${i}`,
    details: `Action performed successfully on resource ${i}`,
    status: i % 8 === 0 ? "error" : i % 5 === 0 ? "warning" : "success",
  }));
}

function mockFraudAlerts(): FraudAlert[] {
  const types = [
    "velocity",
    "duplicate_link",
    "suspicious_ip",
    "bot_pattern",
  ] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `fraud_${i}`,
    timestamp: Date.now() - i * 900000,
    userId: `user_${i % 8}`,
    alertType: types[i % types.length],
    riskScore: 60 + i * 4,
    orderId: `ORD-${1000 + i}`,
    actionTaken: i % 3 === 0 ? "Order blocked" : "Flagged for review",
    resolved: i % 3 === 0,
  }));
}

function mockConfig(): AdminConfig {
  return {
    globalMarginPercent: 22,
    maxOrdersPerUserPerDay: 50,
    maxConcurrentOrdersPerLink: 3,
    minUserAgeDays: 0,
    autoRefundHours: 72,
    fraudVelocityLimit: 10,
    fraudDuplicateLinkThreshold: 3,
    subscriptionsEnabled: true,
    referralsEnabled: true,
  };
}
