import type { Order, User } from "@/types";

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalActiveOrders: number;
  avgOrderValue: number;
  profitMarginPercent: number;
  newUsersThisMonth: number;
  subscriptionRevenue: { free: number; pro: number; premium: number };
  dailyRevenue: number[];
  dailyOrders: number[];
  topServices: {
    serviceId: string;
    name: string;
    revenue: number;
    unitsSold: number;
  }[];
}

// ─── Admin Order ─────────────────────────────────────────────────────────────
export interface AdminOrder extends Order {
  userId: string;
  adminNote: string;
}

// ─── Admin User ──────────────────────────────────────────────────────────────
export interface AdminUser extends User {
  totalSpend: number;
  subscriptionTier: "free" | "pro" | "premium";
  status: "active" | "banned" | "suspended";
  lastLogin: number;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  apiKeyMasked: string;
  commissionPercent: number;
  priority: number;
  status: "active" | "inactive" | "error";
  successRate: number;
  failedLast24h: number;
  avgResponseMs: number;
}

// ─── System Log ──────────────────────────────────────────────────────────────
export interface SystemLog {
  id: string;
  timestamp: number;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  details: string;
  status: "success" | "error" | "warning";
}

// ─── Fraud Alert ─────────────────────────────────────────────────────────────
export type FraudAlertType =
  | "velocity"
  | "duplicate_link"
  | "chargebacks"
  | "suspicious_ip"
  | "bot_pattern";

export interface FraudAlert {
  id: string;
  timestamp: number;
  userId: string;
  alertType: FraudAlertType;
  riskScore: number;
  orderId: string;
  actionTaken: string;
  resolved: boolean;
}

// ─── Admin Config ────────────────────────────────────────────────────────────
export interface AdminConfig {
  globalMarginPercent: number;
  maxOrdersPerUserPerDay: number;
  maxConcurrentOrdersPerLink: number;
  minUserAgeDays: number;
  autoRefundHours: number;
  fraudVelocityLimit: number;
  fraudDuplicateLinkThreshold: number;
  subscriptionsEnabled: boolean;
  referralsEnabled: boolean;
}

// ─── Admin Pricing Stats ─────────────────────────────────────────────────────
export interface AdminPricingStats {
  totalServices: number;
  avgBasicMargin: number;
  avgRecommendedMargin: number;
  avgPremiumMargin: number;
  topRevenueService: string;
  premiumOrderPercent: number;
}

// ─── Admin Coupon ─────────────────────────────────────────────────────────────
export interface AdminCoupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUsageCount: number;
  usageCount: number;
  expiryDate: number;
  applicableServices: string[];
  isActive: boolean;
  createdAt: number;
  totalDiscountGiven: number;
}

// ─── Admin Engagement Config ──────────────────────────────────────────────────
export interface AdminEngagementConfig {
  dailyRewardAmount: number;
  spinWheelMinReward: number;
  spinWheelMaxReward: number;
  referralCommissionPercent: number;
  firstOrderDiscountPercent: number;
  cashbackPercent: number;
  spinWheelEnabled: boolean;
  dailyRewardEnabled: boolean;
  referralEnabled: boolean;
}

// ─── Admin Translation ────────────────────────────────────────────────────────
export interface AdminTranslation {
  key: string;
  en: string;
  hi: string;
  hinglish: string;
  ar: string;
}

// ─── Filter types ─────────────────────────────────────────────────────────────
export interface AdminOrderFilters {
  status?: string;
  userId?: string;
  search?: string;
  page?: number;
}

export interface AdminUserFilters {
  status?: string;
  tier?: string;
  search?: string;
  page?: number;
}

export interface AdminLogFilters {
  action?: string;
  actorId?: string;
  status?: string;
  page?: number;
}

export interface AdminFraudFilters {
  resolved?: boolean;
  alertType?: string;
  page?: number;
}
