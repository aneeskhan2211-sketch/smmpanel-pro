import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TicketPublic {
    id: TicketId;
    status: TicketStatus;
    subject: string;
    userId: UserId;
    createdAt: Timestamp;
    lastUpdatedAt: Timestamp;
    category: TicketCategory;
}
export interface PlaceOrderRequest {
    link: string;
    quantity: bigint;
    serviceId: ServiceId;
}
export interface UserPublic {
    id: UserId;
    username: string;
    createdAt: Timestamp;
    role: UserRole;
    email: string;
    avatar?: string;
}
export type OrderId = bigint;
export type TicketId = bigint;
export type TransactionId = bigint;
export interface CouponPublic {
    id: bigint;
    expiryDate: Timestamp;
    code: string;
    maxUsageCount: bigint;
    createdAt: Timestamp;
    usageCount: bigint;
    applicableServices: Array<ServiceId>;
    isActive: boolean;
    discountPercentage: number;
}
export interface UserSubscriptionPublic {
    endDate: Timestamp;
    planId: SubscriptionPlanId;
    userId: UserId;
    isActive: boolean;
    autoRenew: boolean;
    startDate: Timestamp;
}
export interface AdminPricingRulePublic {
    id: bigint;
    recommendedMargin: number;
    createdAt: Timestamp;
    basicMargin: number;
    isActive: boolean;
    currencyOverrides: Array<[string, number]>;
    premiumMargin: number;
    targetServices: Array<ServiceId>;
}
export interface CurrencyPublic {
    displayName: string;
    code: string;
    flag: string;
    isActive: boolean;
    exchangeRate: number;
    symbol: string;
}
export interface SystemLog {
    id: bigint;
    status: LogStatus;
    action: string;
    actorId: string;
    timestamp: bigint;
    targetType: string;
    details: string;
    targetId: string;
}
export interface ServiceTierPublic {
    id: bigint;
    features: Array<string>;
    displayName: string;
    name: TierName;
    marginMultiplier: number;
    description: string;
    deliveryMultiplier: number;
    isActive: boolean;
    priorityProcessing: boolean;
    refillGuarantee: boolean;
    supportLevel: SupportLevel;
    badge: string;
}
export interface ReviewPublic {
    id: bigint;
    displayOrder: bigint;
    userId: UserId;
    createdAt: Timestamp;
    comment: string;
    rating: bigint;
    serviceId: ServiceId;
    adminApproved: boolean;
}
export interface DashboardStats {
    totalOrders: bigint;
    subscriptionRevenue: {
        pro: bigint;
        premium: bigint;
        free: bigint;
    };
    dailyRevenue: Array<number>;
    totalUsers: bigint;
    totalRevenue: number;
    topServices: Array<TopServiceStat>;
    totalActiveOrders: bigint;
    profitMarginPercent: number;
    newUsersThisMonth: bigint;
    avgOrderValue: number;
    dailyOrders: Array<bigint>;
}
export type UserId = Principal;
export interface ServiceStat {
    name: string;
    serviceId: bigint;
    totalRevenue: number;
    unitsSold: bigint;
    profitMarginPercent: number;
}
export type NotificationId = bigint;
export type TicketMessageId = bigint;
export interface TicketMessage {
    id: TicketMessageId;
    authorId: UserId;
    createdAt: Timestamp;
    ticketId: TicketId;
    message: string;
    isAdminReply: boolean;
}
export interface UserLevelPublic {
    id: bigint;
    maxSpend: bigint;
    displayName: string;
    cashbackPercent: number;
    minSpend: bigint;
    levelName: LevelName;
    badge: string;
    perks: Array<string>;
}
export interface ServicePublic {
    id: ServiceId;
    currencyPrices: Array<[string, number]>;
    pricePerThousand: bigint;
    reliabilityScore: bigint;
    refillPolicy: RefillPolicy;
    maxQuantity: bigint;
    urgencySignal: string;
    basicPrice: bigint;
    premiumPrice: bigint;
    hasRefill: boolean;
    successRate: bigint;
    name: string;
    deliveryTimeHours: bigint;
    platform: Platform;
    isActive: boolean;
    recommendedPrice: bigint;
    retentionScore: bigint;
    category: string;
    qualityRating: bigint;
    providerId?: bigint;
    minQuantity: bigint;
    baseCost: bigint;
}
export interface ReferralPublic {
    id: bigint;
    status: ReferralStatus;
    referredUserId: UserId;
    createdAt: Timestamp;
    earnings: bigint;
    referrerId: UserId;
    commissionPercent: number;
}
export type Timestamp = bigint;
export type ApiKeyId = bigint;
export interface ApiKeyPublic {
    id: ApiKeyId;
    userId: UserId;
    name: string;
    createdAt: Timestamp;
    usageCount: bigint;
    maskedKey: string;
    isActive: boolean;
    lastUsed?: Timestamp;
}
export interface OrderPublic {
    id: OrderId;
    status: OrderStatus;
    completedAt?: Timestamp;
    userId: UserId;
    link: string;
    createdAt: Timestamp;
    estimatedDelivery: Timestamp;
    quantity: bigint;
    serviceId: ServiceId;
    totalPrice: bigint;
}
export interface Transaction {
    id: TransactionId;
    status: TransactionStatus;
    userId: UserId;
    createdAt: Timestamp;
    description: string;
    txType: TransactionType;
    amount: bigint;
}
export interface BundlePublic {
    id: bigint;
    hasPremiumUpgrade: boolean;
    originalPrice: bigint;
    name: string;
    description: string;
    estimatedDeliveryHours: bigint;
    isActive: boolean;
    imageEmoji: string;
    badge: string;
    discountedPrice: bigint;
    services: Array<BundleService>;
}
export interface BundleService {
    quantity: bigint;
    serviceId: ServiceId;
}
export interface TopServiceStat {
    revenue: number;
    name: string;
    serviceId: bigint;
    unitsSold: bigint;
}
export interface SubscriptionPlan {
    id: SubscriptionPlanId;
    features: Array<string>;
    name: string;
    tier: PlanTier;
    discountPercent: bigint;
    priceMonthly: bigint;
}
export interface NotificationPublic {
    id: NotificationId;
    notifType: NotificationType;
    userId: UserId;
    createdAt: Timestamp;
    isRead: boolean;
    message: string;
}
export type ServiceId = bigint;
export interface ProviderPublic {
    id: bigint;
    status: ProviderStatus;
    apiKeyMasked: string;
    successRate: number;
    name: string;
    avgResponseMs: bigint;
    apiUrl: string;
    commissionPercent: number;
    priority: bigint;
    failedLast24h: bigint;
}
export interface EngagementLog {
    id: bigint;
    activityType: ActivityType;
    userId: UserId;
    timestamp: Timestamp;
    amount: bigint;
}
export interface FraudAlertPublic {
    id: bigint;
    resolved: boolean;
    alertType: AlertType;
    userId: string;
    orderId?: string;
    timestamp: bigint;
    actionTaken: AlertAction;
    riskScore: bigint;
}
export interface WalletRewardPublic {
    id: bigint;
    percentageAmount: number;
    isActive: boolean;
    rewardType: RewardType;
    frequency: string;
    amount: bigint;
}
export type SubscriptionPlanId = bigint;
export interface TicketWithMessages {
    ticket: {
        id: TicketId;
        status: TicketStatus;
        subject: string;
        userId: UserId;
        createdAt: Timestamp;
        lastUpdatedAt: Timestamp;
        category: TicketCategory;
    };
    messages: Array<TicketMessage>;
}
export interface AdminConfig {
    referralsEnabled: boolean;
    globalMarginPercent: number;
    maxOrdersPerUserPerDay: bigint;
    autoRefundHours: bigint;
    fraudDuplicateLinkThreshold: bigint;
    subscriptionsEnabled: boolean;
    fraudVelocityLimit: bigint;
    minUserAgeDays: bigint;
    maxConcurrentOrdersPerLink: bigint;
}
export interface UserStats {
    totalOrders: bigint;
    totalSpend: bigint;
    completedOrders: bigint;
    activeOrders: bigint;
}
export enum ActivityType {
    referralEarn = "referralEarn",
    spinWheel = "spinWheel",
    firstOrder = "firstOrder",
    dailyLogin = "dailyLogin",
    coupon = "coupon",
    cashback = "cashback"
}
export enum AlertAction {
    blocked = "blocked",
    whitelisted = "whitelisted",
    flagged = "flagged"
}
export enum AlertType {
    bulkOrders = "bulkOrders",
    lowServiceRatio = "lowServiceRatio",
    highVelocity = "highVelocity",
    duplicateLink = "duplicateLink"
}
export enum LevelName {
    bronze = "bronze",
    gold = "gold",
    platinum = "platinum",
    silver = "silver"
}
export enum LogStatus {
    error = "error",
    success = "success"
}
export enum NotificationType {
    wallet_alert = "wallet_alert",
    support_reply = "support_reply",
    order_update = "order_update",
    promo = "promo"
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    processing = "processing",
    failed = "failed"
}
export enum PlanTier {
    pro = "pro",
    premium = "premium",
    free = "free"
}
export enum Platform {
    ai = "ai",
    tiktok = "tiktok",
    twitter = "twitter",
    instagram = "instagram",
    website = "website",
    facebook = "facebook",
    business = "business",
    youtube = "youtube",
    telegram = "telegram"
}
export enum ProviderStatus {
    active = "active",
    inactive = "inactive",
    testing = "testing"
}
export enum ReferralStatus {
    expired = "expired",
    pending = "pending",
    confirmed = "confirmed"
}
export enum RefillPolicy {
    none = "none",
    guaranteed = "guaranteed",
    limited = "limited"
}
export enum RewardType {
    referral = "referral",
    spinWheel = "spinWheel",
    firstOrder = "firstOrder",
    daily = "daily",
    cashback = "cashback"
}
export enum ServiceSort {
    best = "best",
    cheapest = "cheapest",
    fastest = "fastest"
}
export enum SupportLevel {
    dedicated = "dedicated",
    priority = "priority",
    standard = "standard"
}
export enum TicketCategory {
    order = "order",
    billing = "billing",
    technical = "technical",
    general = "general"
}
export enum TicketStatus {
    resolved = "resolved",
    closed = "closed",
    in_progress = "in_progress",
    open = "open"
}
export enum TierName {
    premium = "premium",
    recommended = "recommended",
    basic = "basic"
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TransactionType {
    credit = "credit",
    debit = "debit",
    refund = "refund"
}
export enum UserRole {
    admin = "admin",
    user = "user"
}
export interface backendInterface {
    adminAddBundle(name: string, description: string, services: Array<BundleService>, originalPrice: bigint, discountedPrice: bigint, estimatedDeliveryHours: bigint, hasPremiumUpgrade: boolean, badge: string, imageEmoji: string): Promise<BundlePublic>;
    adminAddCoupon(code: string, discountPercentage: number, maxUsageCount: bigint, expiryDate: Timestamp, applicableServices: Array<ServiceId>): Promise<CouponPublic>;
    adminAddCurrency(code: string, symbol: string, flag: string, displayName: string, exchangeRate: number): Promise<CurrencyPublic>;
    adminAddFunds(userId: UserId, amount: bigint, description: string): Promise<Transaction>;
    adminAddPricingRule(targetServices: Array<ServiceId>, basicMargin: number, recommendedMargin: number, premiumMargin: number, currencyOverrides: Array<[string, number]>): Promise<AdminPricingRulePublic>;
    adminAddProvider(name: string, apiUrl: string, apiKey: string, commissionPercent: number, priority: bigint): Promise<ProviderPublic>;
    adminAddService(name: string, platform: Platform, pricePerThousand: bigint, minQuantity: bigint, maxQuantity: bigint, deliveryTimeHours: bigint, hasRefill: boolean, qualityRating: bigint, reliabilityScore: bigint): Promise<ServicePublic>;
    adminAdjustUserWallet(userId: Principal, amount: number, reason: string, isCredit: boolean): Promise<void>;
    adminApproveReview(reviewId: bigint, displayOrder: bigint): Promise<void>;
    adminBanUser(userId: Principal, reason: string): Promise<void>;
    adminBatchUpdateServicePrices(serviceIds: Array<bigint>, percentageChange: number): Promise<void>;
    adminCancelOrder(orderId: bigint, reason: string): Promise<void>;
    adminGetAllOrders(statusFilter: string | null, limit: bigint, offset: bigint): Promise<Array<OrderPublic>>;
    adminGetAllUsers(statusFilter: string | null, tierFilter: string | null, limit: bigint, offset: bigint): Promise<Array<UserPublic>>;
    adminGetConfig(): Promise<AdminConfig>;
    adminGetDashboardStats(): Promise<DashboardStats>;
    adminGetFraudAlerts(resolved: boolean | null, riskLevel: bigint | null, limit: bigint, offset: bigint): Promise<Array<FraudAlertPublic>>;
    adminGetLogs(actionFilter: string | null, limit: bigint, offset: bigint): Promise<Array<SystemLog>>;
    adminGetPricingRules(): Promise<Array<AdminPricingRulePublic>>;
    adminGetProviders(): Promise<Array<ProviderPublic>>;
    adminGetServiceStats(): Promise<Array<ServiceStat>>;
    adminGetWalletRewards(): Promise<Array<WalletRewardPublic>>;
    adminListOrders(): Promise<Array<OrderPublic>>;
    adminListTickets(): Promise<Array<TicketPublic>>;
    adminListUsers(): Promise<Array<UserPublic>>;
    adminReplyToTicket(ticketId: TicketId, message: string): Promise<TicketMessage>;
    adminResolveFraudAlert(alertId: bigint, action: string): Promise<void>;
    adminSetUserRole(targetId: UserId, role: UserRole): Promise<void>;
    adminUpdateBundle(bundleId: bigint, name: string | null, discountedPrice: bigint | null, isActive: boolean | null): Promise<boolean>;
    adminUpdateConfig(config: AdminConfig): Promise<void>;
    adminUpdateExchangeRate(currencyCode: string, newRate: number): Promise<boolean>;
    adminUpdateOrderManual(orderId: bigint, newStatus: string | null, newPrice: number | null, newQuantity: bigint | null, reason: string): Promise<void>;
    adminUpdateOrderStatus(orderId: OrderId, newStatus: OrderStatus): Promise<void>;
    adminUpdateProvider(providerId: bigint, status: string | null, commissionPercent: number | null, priority: bigint | null): Promise<void>;
    adminUpdateService(serviceId: ServiceId, name: string, pricePerThousand: bigint, isActive: boolean): Promise<void>;
    adminUpdateServiceVisibility(serviceId: bigint, visible: boolean): Promise<void>;
    adminUpdateTier(tierId: bigint, marginMultiplier: number | null, deliveryMultiplier: number | null, features: Array<string> | null, isActive: boolean | null): Promise<boolean>;
    adminUpdateWalletReward(rewardId: bigint, amount: bigint | null, percentageAmount: number | null, isActive: boolean | null): Promise<void>;
    calculateTierPrice(basePrice: bigint, tierId: bigint): Promise<bigint | null>;
    cancelMySubscription(): Promise<void>;
    cancelOrder(orderId: OrderId): Promise<void>;
    claimDailyLoginReward(): Promise<bigint>;
    closeMyTicket(ticketId: TicketId): Promise<void>;
    convertPrice(amountINR: bigint, currencyCode: string): Promise<number | null>;
    createReferral(referredUserId: Principal): Promise<ReferralPublic>;
    createTicket(subject: string, category: TicketCategory): Promise<TicketPublic>;
    generateApiKey(name: string): Promise<ApiKeyPublic>;
    getAllApprovedReviews(limit: bigint): Promise<Array<ReviewPublic>>;
    getBundle(bundleId: bigint): Promise<BundlePublic | null>;
    getMyBalance(): Promise<bigint>;
    getMyEngagementHistory(limit: bigint): Promise<Array<EngagementLog>>;
    getMyLevel(): Promise<UserLevelPublic | null>;
    getMyNotifications(): Promise<Array<NotificationPublic>>;
    getMyOrders(): Promise<Array<OrderPublic>>;
    getMyProfile(): Promise<UserPublic>;
    getMyReferrals(): Promise<Array<ReferralPublic>>;
    getMyStats(): Promise<UserStats>;
    getMySubscription(): Promise<UserSubscriptionPublic | null>;
    getMyTickets(): Promise<Array<TicketPublic>>;
    getMyTransactions(): Promise<Array<Transaction>>;
    getOrderById(orderId: OrderId): Promise<OrderPublic | null>;
    getServicePricing(basePriceINR: bigint, serviceId: ServiceId): Promise<[number, number, number]>;
    getServiceReviews(serviceId: ServiceId, limit: bigint): Promise<Array<ReviewPublic>>;
    getServicesByPlatform(platform: Platform): Promise<Array<ServicePublic>>;
    getServicesSorted(sortBy: ServiceSort): Promise<Array<ServicePublic>>;
    getSubscriptionPlans(): Promise<Array<SubscriptionPlan>>;
    getTicketDetail(ticketId: TicketId): Promise<TicketWithMessages | null>;
    getUnreadNotificationCount(): Promise<bigint>;
    listBundles(): Promise<Array<BundlePublic>>;
    listCurrencies(): Promise<Array<CurrencyPublic>>;
    listMyApiKeys(): Promise<Array<ApiKeyPublic>>;
    listMyCoupons(): Promise<Array<CouponPublic>>;
    listServiceTiers(): Promise<Array<ServiceTierPublic>>;
    listServices(): Promise<Array<ServicePublic>>;
    listUserLevels(): Promise<Array<UserLevelPublic>>;
    markNotificationRead(notifId: NotificationId): Promise<void>;
    placeOrder(req: PlaceOrderRequest): Promise<OrderPublic>;
    registerUser(username: string, email: string): Promise<UserPublic>;
    replyToTicket(ticketId: TicketId, message: string): Promise<TicketMessage>;
    revokeApiKey(keyId: ApiKeyId): Promise<void>;
    searchServices(searchTerm: string): Promise<Array<ServicePublic>>;
    spinWheelReward(): Promise<bigint>;
    submitReview(serviceId: ServiceId, rating: bigint, comment: string): Promise<ReviewPublic>;
    subscribeToPlan(planId: SubscriptionPlanId, autoRenew: boolean): Promise<UserSubscriptionPublic>;
    updateMyProfile(username: string, email: string, avatar: string | null): Promise<UserPublic>;
    validateCoupon(code: string, serviceId: ServiceId): Promise<number | null>;
}
