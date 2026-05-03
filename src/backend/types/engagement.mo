import Common "common";

module {
  // --- User Levels ---
  public type LevelName = { #bronze; #silver; #gold; #platinum };

  public type UserLevel = {
    id : Nat;
    var levelName : LevelName;
    var displayName : Text;
    var badge : Text;
    var minSpend : Nat; // in INR paise
    var maxSpend : Nat; // 0 = unlimited
    var cashbackPercent : Float;
    var perks : [Text];
  };

  public type UserLevelPublic = {
    id : Nat;
    levelName : LevelName;
    displayName : Text;
    badge : Text;
    minSpend : Nat;
    maxSpend : Nat;
    cashbackPercent : Float;
    perks : [Text];
  };

  // --- Wallet Rewards ---
  public type RewardType = { #daily; #referral; #cashback; #spinWheel; #firstOrder };

  public type WalletReward = {
    id : Nat;
    var rewardType : RewardType;
    var amount : Nat; // flat amount in INR paise
    var percentageAmount : Float; // percentage (used for referral/cashback)
    var frequency : Text; // "daily", "per_order", "one_time"
    var isActive : Bool;
  };

  public type WalletRewardPublic = {
    id : Nat;
    rewardType : RewardType;
    amount : Nat;
    percentageAmount : Float;
    frequency : Text;
    isActive : Bool;
  };

  // --- Engagement Logs ---
  public type ActivityType = {
    #dailyLogin;
    #referralEarn;
    #cashback;
    #spinWheel;
    #coupon;
    #firstOrder;
  };

  public type EngagementLog = {
    id : Nat;
    userId : Common.UserId;
    activityType : ActivityType;
    amount : Nat;
    timestamp : Common.Timestamp;
  };

  // --- Coupons ---
  public type Coupon = {
    id : Nat;
    var code : Text;
    var discountPercentage : Float;
    var maxUsageCount : Nat; // 0 = unlimited
    var usageCount : Nat;
    var expiryDate : Common.Timestamp; // 0 = never
    var applicableServices : [Common.ServiceId]; // empty = all services
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type CouponPublic = {
    id : Nat;
    code : Text;
    discountPercentage : Float;
    maxUsageCount : Nat;
    usageCount : Nat;
    expiryDate : Common.Timestamp;
    applicableServices : [Common.ServiceId];
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  // --- Referrals ---
  public type ReferralStatus = { #pending; #confirmed; #expired };

  public type Referral = {
    id : Nat;
    referrerId : Common.UserId;
    referredUserId : Common.UserId;
    var commissionPercent : Float;
    var earnings : Nat; // in INR paise
    var status : ReferralStatus;
    createdAt : Common.Timestamp;
  };

  public type ReferralPublic = {
    id : Nat;
    referrerId : Common.UserId;
    referredUserId : Common.UserId;
    commissionPercent : Float;
    earnings : Nat;
    status : ReferralStatus;
    createdAt : Common.Timestamp;
  };

  // --- Reviews ---
  public type Review = {
    id : Nat;
    userId : Common.UserId;
    serviceId : Common.ServiceId;
    var rating : Nat; // 1-5
    var comment : Text;
    var adminApproved : Bool;
    var displayOrder : Nat;
    createdAt : Common.Timestamp;
  };

  public type ReviewPublic = {
    id : Nat;
    userId : Common.UserId;
    serviceId : Common.ServiceId;
    rating : Nat;
    comment : Text;
    adminApproved : Bool;
    displayOrder : Nat;
    createdAt : Common.Timestamp;
  };

  // --- Admin Pricing Rules ---
  public type AdminPricingRule = {
    id : Nat;
    var targetServices : [Common.ServiceId]; // empty = all services
    var basicMargin : Float; // multiplier e.g. 1.2 = 20% margin
    var recommendedMargin : Float;
    var premiumMargin : Float;
    var currencyOverrides : [(Text, Float)]; // (currencyCode, rateOverride)
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type AdminPricingRulePublic = {
    id : Nat;
    targetServices : [Common.ServiceId];
    basicMargin : Float;
    recommendedMargin : Float;
    premiumMargin : Float;
    currencyOverrides : [(Text, Float)];
    isActive : Bool;
    createdAt : Common.Timestamp;
  };
};
