// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
  role: "user" | "admin";
  apiKey?: string;
  createdAt: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "active"
  | "completed"
  | "cancelled"
  | "partial"
  | "refunded";

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  remains: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

// ─── Services ────────────────────────────────────────────────────────────────
export type ServiceCategory =
  | "instagram"
  | "youtube"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "telegram"
  | "website"
  | "business"
  | "ai";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  pricePerThousand: number;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  refill: boolean;
  rating: number;
  description: string;
  speed: "fast" | "medium" | "slow";
  // Premium pricing tier fields
  basicPrice?: number;
  recommendedPrice?: number;
  premiumPrice?: number;
  baseCost?: number;
  successRate?: number;
  retentionScore?: number;
  refillPolicy?: "none" | "limited" | "guaranteed";
  currencyPrices?: Record<string, number>;
  urgencySignal?: string;
}

// ─── Service Tier ─────────────────────────────────────────────────────────────
export type TierName = "basic" | "recommended" | "premium";

export interface ServiceTier {
  id: string;
  name: TierName;
  displayName: string;
  description: string;
  badge: string;
  features: string[];
  marginMultiplier: number;
  deliveryMultiplier: number;
  refillGuarantee: boolean;
  priorityProcessing: boolean;
  supportLevel: "standard" | "priority" | "dedicated";
  isActive: boolean;
}

// ─── Bundle ───────────────────────────────────────────────────────────────────
export interface BundleServiceItem {
  serviceId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  services: BundleServiceItem[];
  originalPrice: number;
  discountedPrice: number;
  estimatedDeliveryHours: number;
  hasPremiumUpgrade: boolean;
  badge: string;
  imageEmoji: string;
  isActive: boolean;
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export interface Currency {
  code: string;
  symbol: string;
  flag: string;
  displayName: string;
  exchangeRate: number;
  isActive: boolean;
}

// ─── Language Translation ─────────────────────────────────────────────────────
export interface LanguageTranslation {
  language: string;
  key: string;
  value: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUsageCount: number;
  usageCount: number;
  expiryDate: number;
  applicableServices: string[];
  isActive: boolean;
  createdAt: number;
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export type ReferralStatus = "pending" | "confirmed" | "expired";

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: ReferralStatus;
  earnings: number;
  commissionPercent: number;
  createdAt: number;
}

// ─── User Level ───────────────────────────────────────────────────────────────
export type LevelName = "bronze" | "silver" | "gold" | "platinum";

export interface UserLevel {
  id: string;
  levelName: LevelName;
  displayName: string;
  badge: string;
  minSpend: number;
  maxSpend: number;
  cashbackPercent: number;
  perks: string[];
}

// ─── Engagement Log ───────────────────────────────────────────────────────────
export type ActivityType =
  | "dailyLogin"
  | "referralEarn"
  | "spinWheel"
  | "firstOrder"
  | "coupon"
  | "cashback";

export interface EngagementLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  amount: number;
  timestamp: number;
}

// ─── Wallet Reward ────────────────────────────────────────────────────────────
export type RewardType =
  | "daily"
  | "referral"
  | "spinWheel"
  | "firstOrder"
  | "cashback";

export interface WalletReward {
  id: string;
  rewardType: RewardType;
  amount: number;
  percentageAmount: number;
  frequency: string;
  isActive: boolean;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  rating: number;
  comment: string;
  adminApproved: boolean;
  displayOrder: number;
  createdAt: number;
}

// ─── Admin Pricing Rule ───────────────────────────────────────────────────────
export interface AdminPricingRule {
  id: string;
  targetServices: string[];
  basicMargin: number;
  recommendedMargin: number;
  premiumMargin: number;
  currencyOverrides: Record<string, number>;
  isActive: boolean;
  createdAt: number;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export type TransactionType = "deposit" | "withdrawal" | "refund" | "order";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: number;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────
export type PlanTier = "free" | "pro" | "premium";

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  features: string[];
  discount: number;
}

// ─── Support ──────────────────────────────────────────────────────────────────
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  isAdmin: boolean;
  createdAt: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: SupportMessage[];
  createdAt: number;
  updatedAt: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  walletBalance: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
