import EngagementTypes "../types/engagement";
import Common "../types/common";
import WalletTypes "../types/wallet";
import WalletLib "wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";

module {
  // --- User Levels ---

  public func toUserLevelPublic(l : EngagementTypes.UserLevel) : EngagementTypes.UserLevelPublic {
    {
      id = l.id;
      levelName = l.levelName;
      displayName = l.displayName;
      badge = l.badge;
      minSpend = l.minSpend;
      maxSpend = l.maxSpend;
      cashbackPercent = l.cashbackPercent;
      perks = l.perks;
    };
  };

  public func listUserLevels(levels : List.List<EngagementTypes.UserLevel>) : [EngagementTypes.UserLevelPublic] {
    levels.map<EngagementTypes.UserLevel, EngagementTypes.UserLevelPublic>(func(l) { toUserLevelPublic(l) }).toArray();
  };

  public func addUserLevel(
    levels : List.List<EngagementTypes.UserLevel>,
    nextId : Nat,
    levelName : EngagementTypes.LevelName,
    displayName : Text,
    badge : Text,
    minSpend : Nat,
    maxSpend : Nat,
    cashbackPercent : Float,
    perks : [Text],
  ) : EngagementTypes.UserLevel {
    let level : EngagementTypes.UserLevel = {
      id = nextId;
      var levelName = levelName;
      var displayName = displayName;
      var badge = badge;
      var minSpend = minSpend;
      var maxSpend = maxSpend;
      var cashbackPercent = cashbackPercent;
      var perks = perks;
    };
    levels.add(level);
    level;
  };

  public func getUserLevelForSpend(
    levels : List.List<EngagementTypes.UserLevel>,
    totalSpend : Nat,
  ) : ?EngagementTypes.UserLevelPublic {
    // Find the highest tier the user qualifies for
    let eligible = levels.filter(func(l) { totalSpend >= l.minSpend });
    switch (eligible.last()) {
      case (?l) { ?toUserLevelPublic(l) };
      case null { null };
    };
  };

  // --- Wallet Rewards ---

  public func toWalletRewardPublic(r : EngagementTypes.WalletReward) : EngagementTypes.WalletRewardPublic {
    {
      id = r.id;
      rewardType = r.rewardType;
      amount = r.amount;
      percentageAmount = r.percentageAmount;
      frequency = r.frequency;
      isActive = r.isActive;
    };
  };

  public func addWalletReward(
    rewards : List.List<EngagementTypes.WalletReward>,
    nextId : Nat,
    rewardType : EngagementTypes.RewardType,
    amount : Nat,
    percentageAmount : Float,
    frequency : Text,
  ) : EngagementTypes.WalletReward {
    let reward : EngagementTypes.WalletReward = {
      id = nextId;
      var rewardType = rewardType;
      var amount = amount;
      var percentageAmount = percentageAmount;
      var frequency = frequency;
      var isActive = true;
    };
    rewards.add(reward);
    reward;
  };

  public func getActiveRewardByType(
    rewards : List.List<EngagementTypes.WalletReward>,
    rewardType : EngagementTypes.RewardType,
  ) : ?EngagementTypes.WalletReward {
    rewards.find(func(r) { r.isActive and r.rewardType == rewardType });
  };

  // --- Engagement Logs ---

  public func addEngagementLog(
    logs : List.List<EngagementTypes.EngagementLog>,
    nextId : Nat,
    userId : Common.UserId,
    activityType : EngagementTypes.ActivityType,
    amount : Nat,
  ) : () {
    logs.add({
      id = nextId;
      userId = userId;
      activityType = activityType;
      amount = amount;
      timestamp = Time.now();
    });
  };

  public func getUserEngagementLogs(
    logs : List.List<EngagementTypes.EngagementLog>,
    userId : Common.UserId,
    limit : Nat,
  ) : [EngagementTypes.EngagementLog] {
    let userLogs = logs.filter(func(l) { l.userId == userId });
    let arr = userLogs.toArray().reverse();
    arr.sliceToArray(0, if (arr.size() < limit) { arr.size() } else { limit });
  };

  // Check if user already claimed daily reward today
  public func hasClaimedDailyReward(
    logs : List.List<EngagementTypes.EngagementLog>,
    userId : Common.UserId,
  ) : Bool {
    let oneDayNs : Int = 24 * 3_600_000_000_000;
    let now = Time.now();
    let cutoff = now - oneDayNs;
    logs.any(func(l) {
      l.userId == userId and l.activityType == #dailyLogin and l.timestamp >= cutoff;
    });
  };

  // --- Coupons ---

  public func toCouponPublic(c : EngagementTypes.Coupon) : EngagementTypes.CouponPublic {
    {
      id = c.id;
      code = c.code;
      discountPercentage = c.discountPercentage;
      maxUsageCount = c.maxUsageCount;
      usageCount = c.usageCount;
      expiryDate = c.expiryDate;
      applicableServices = c.applicableServices;
      isActive = c.isActive;
      createdAt = c.createdAt;
    };
  };

  public func addCoupon(
    coupons : List.List<EngagementTypes.Coupon>,
    nextId : Nat,
    code : Text,
    discountPercentage : Float,
    maxUsageCount : Nat,
    expiryDate : Common.Timestamp,
    applicableServices : [Common.ServiceId],
  ) : EngagementTypes.Coupon {
    let coupon : EngagementTypes.Coupon = {
      id = nextId;
      var code = code;
      var discountPercentage = discountPercentage;
      var maxUsageCount = maxUsageCount;
      var usageCount = 0;
      var expiryDate = expiryDate;
      var applicableServices = applicableServices;
      var isActive = true;
      createdAt = Time.now();
    };
    coupons.add(coupon);
    coupon;
  };

  // Validate and apply coupon; returns discount percentage or null if invalid
  public func validateCoupon(
    coupons : List.List<EngagementTypes.Coupon>,
    code : Text,
    serviceId : Common.ServiceId,
  ) : ?Float {
    let now = Time.now();
    switch (coupons.find(func(c) { c.code == code and c.isActive })) {
      case (?c) {
        // Check expiry
        if (c.expiryDate > 0 and c.expiryDate < now) { return null };
        // Check usage limit
        if (c.maxUsageCount > 0 and c.usageCount >= c.maxUsageCount) { return null };
        // Check service applicability
        let serviceOk = c.applicableServices.size() == 0 or
          c.applicableServices.find(func(sid) { sid == serviceId }) != null;
        if (not serviceOk) { return null };
        ?c.discountPercentage;
      };
      case null { null };
    };
  };

  public func incrementCouponUsage(
    coupons : List.List<EngagementTypes.Coupon>,
    code : Text,
  ) : () {
    coupons.mapInPlace(func(c) {
      if (c.code == code) {
        c.usageCount += 1;
        // Deactivate if max usage reached
        if (c.maxUsageCount > 0 and c.usageCount >= c.maxUsageCount) {
          c.isActive := false;
        };
        c;
      } else { c };
    });
  };

  // --- Referrals ---

  public func toReferralPublic(r : EngagementTypes.Referral) : EngagementTypes.ReferralPublic {
    {
      id = r.id;
      referrerId = r.referrerId;
      referredUserId = r.referredUserId;
      commissionPercent = r.commissionPercent;
      earnings = r.earnings;
      status = r.status;
      createdAt = r.createdAt;
    };
  };

  public func addReferral(
    referrals : List.List<EngagementTypes.Referral>,
    nextId : Nat,
    referrerId : Common.UserId,
    referredUserId : Common.UserId,
    commissionPercent : Float,
  ) : EngagementTypes.Referral {
    let referral : EngagementTypes.Referral = {
      id = nextId;
      referrerId = referrerId;
      referredUserId = referredUserId;
      var commissionPercent = commissionPercent;
      var earnings = 0;
      var status = #pending;
      createdAt = Time.now();
    };
    referrals.add(referral);
    referral;
  };

  public func getUserReferrals(
    referrals : List.List<EngagementTypes.Referral>,
    userId : Common.UserId,
  ) : [EngagementTypes.ReferralPublic] {
    referrals.filter(func(r) { r.referrerId == userId })
      .map<EngagementTypes.Referral, EngagementTypes.ReferralPublic>(func(r) { toReferralPublic(r) })
      .toArray();
  };

  public func confirmReferral(
    referrals : List.List<EngagementTypes.Referral>,
    referredUserId : Common.UserId,
    orderAmount : Nat,
    wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
    transactions : List.List<WalletTypes.Transaction>,
    nextTxId : Nat,
  ) : Nat {
    var txCounter = nextTxId;
    referrals.mapInPlace(func(r) {
      if (r.referredUserId == referredUserId and r.status == #pending) {
        let earnings = Int.abs((orderAmount.toFloat() * r.commissionPercent / 100.0).toInt());
        r.earnings += earnings;
        r.status := #confirmed;
        // Credit referrer wallet
        ignore WalletLib.addFunds(
          wallets, transactions, r.referrerId,
          earnings, "Referral commission earned",
        );
        txCounter += 1;
        r;
      } else { r };
    });
    txCounter;
  };

  // --- Reviews ---

  public func toReviewPublic(r : EngagementTypes.Review) : EngagementTypes.ReviewPublic {
    {
      id = r.id;
      userId = r.userId;
      serviceId = r.serviceId;
      rating = r.rating;
      comment = r.comment;
      adminApproved = r.adminApproved;
      displayOrder = r.displayOrder;
      createdAt = r.createdAt;
    };
  };

  public func addReview(
    reviews : List.List<EngagementTypes.Review>,
    nextId : Nat,
    userId : Common.UserId,
    serviceId : Common.ServiceId,
    rating : Nat,
    comment : Text,
  ) : EngagementTypes.Review {
    let review : EngagementTypes.Review = {
      id = nextId;
      userId = userId;
      serviceId = serviceId;
      var rating = if (rating > 5) { 5 } else { rating };
      var comment = comment;
      var adminApproved = false;
      var displayOrder = nextId;
      createdAt = Time.now();
    };
    reviews.add(review);
    review;
  };

  public func getApprovedReviews(
    reviews : List.List<EngagementTypes.Review>,
    serviceId : ?Common.ServiceId,
    limit : Nat,
  ) : [EngagementTypes.ReviewPublic] {
    let filtered = switch (serviceId) {
      case (?sid) { reviews.filter(func(r) { r.adminApproved and r.serviceId == sid }) };
      case null { reviews.filter(func(r) { r.adminApproved }) };
    };
    let sorted = filtered.sort(func(a, b) {
      if (a.displayOrder < b.displayOrder) { #less }
      else if (a.displayOrder > b.displayOrder) { #greater }
      else { #equal };
    });
    let arr = sorted.map<EngagementTypes.Review, EngagementTypes.ReviewPublic>(func(r) { toReviewPublic(r) }).toArray();
    arr.sliceToArray(0, if (arr.size() < limit) { arr.size() } else { limit });
  };

  // --- Admin Pricing Rules ---

  public func toPricingRulePublic(r : EngagementTypes.AdminPricingRule) : EngagementTypes.AdminPricingRulePublic {
    {
      id = r.id;
      targetServices = r.targetServices;
      basicMargin = r.basicMargin;
      recommendedMargin = r.recommendedMargin;
      premiumMargin = r.premiumMargin;
      currencyOverrides = r.currencyOverrides;
      isActive = r.isActive;
      createdAt = r.createdAt;
    };
  };

  public func addPricingRule(
    rules : List.List<EngagementTypes.AdminPricingRule>,
    nextId : Nat,
    targetServices : [Common.ServiceId],
    basicMargin : Float,
    recommendedMargin : Float,
    premiumMargin : Float,
    currencyOverrides : [(Text, Float)],
  ) : EngagementTypes.AdminPricingRule {
    let rule : EngagementTypes.AdminPricingRule = {
      id = nextId;
      var targetServices = targetServices;
      var basicMargin = basicMargin;
      var recommendedMargin = recommendedMargin;
      var premiumMargin = premiumMargin;
      var currencyOverrides = currencyOverrides;
      var isActive = true;
      createdAt = Time.now();
    };
    rules.add(rule);
    rule;
  };

  // Get effective margins for a service: returns (basicMargin, recommendedMargin, premiumMargin)
  public func getEffectiveMargins(
    rules : List.List<EngagementTypes.AdminPricingRule>,
    serviceId : Common.ServiceId,
  ) : (Float, Float, Float) {
    // Find most specific active rule targeting this service, then fall back to global rule
    let specific = rules.find(func(r) {
      r.isActive and r.targetServices.size() > 0 and
        r.targetServices.find(func(sid) { sid == serviceId }) != null;
    });
    switch (specific) {
      case (?r) { (r.basicMargin, r.recommendedMargin, r.premiumMargin) };
      case null {
        let global = rules.find(func(r) { r.isActive and r.targetServices.size() == 0 });
        switch (global) {
          case (?r) { (r.basicMargin, r.recommendedMargin, r.premiumMargin) };
          case null { (1.0, 1.25, 1.875) }; // default
        };
      };
    };
  };
};
