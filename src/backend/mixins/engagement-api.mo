import Common "../types/common";
import EngagementTypes "../types/engagement";
import UserTypes "../types/users";
import WalletTypes "../types/wallet";
import EngagementLib "../lib/engagement";
import WalletLib "../lib/wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";

mixin (
  users : Map.Map<Common.UserId, UserTypes.User>,
  wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
  transactions : List.List<WalletTypes.Transaction>,
  userLevels : List.List<EngagementTypes.UserLevel>,
  walletRewards : List.List<EngagementTypes.WalletReward>,
  engagementLogs : List.List<EngagementTypes.EngagementLog>,
  coupons : List.List<EngagementTypes.Coupon>,
  referrals : List.List<EngagementTypes.Referral>,
  reviews : List.List<EngagementTypes.Review>,
  pricingRules : List.List<EngagementTypes.AdminPricingRule>,
) {
  var nextEngagementLogId : Nat = 1;
  var nextCouponId : Nat = 1;
  var nextReferralId : Nat = 1;
  var nextReviewId : Nat = 1;
  var nextPricingRuleId : Nat = 1;
  var nextWalletRewardId : Nat = 4; // 3 seeded

  // --- User Levels ---

  public query func listUserLevels() : async [EngagementTypes.UserLevelPublic] {
    EngagementLib.listUserLevels(userLevels);
  };

  public shared query ({ caller }) func getMyLevel() : async ?EngagementTypes.UserLevelPublic {
    let wallet = wallets.get(caller);
    let totalSpend = switch (wallet) {
      case (?w) { w.balance }; // Note: balance is current; ideally track total spend separately
      case null { 0 };
    };
    EngagementLib.getUserLevelForSpend(userLevels, totalSpend);
  };

  // --- Daily Login Reward ---

  public shared ({ caller }) func claimDailyLoginReward() : async Nat {
    if (EngagementLib.hasClaimedDailyReward(engagementLogs, caller)) {
      Runtime.trap("Daily reward already claimed today");
    };
    let rewardConfig = EngagementLib.getActiveRewardByType(walletRewards, #daily);
    let amount = switch (rewardConfig) {
      case (?r) { r.amount };
      case null { 1000 }; // default 10 INR (in paise)
    };
    ignore WalletLib.addFunds(wallets, transactions, caller, amount, "Daily login reward");
    EngagementLib.addEngagementLog(engagementLogs, nextEngagementLogId, caller, #dailyLogin, amount);
    nextEngagementLogId += 1;
    amount;
  };

  // --- Spin Wheel ---

  public shared ({ caller }) func spinWheelReward() : async Nat {
    // Simple pseudo-random reward from 1-5 tiers based on time
    let now = Time.now();
    let slot = Int.abs(now) % 5;
    let rewardAmounts : [Nat] = [500, 1000, 2000, 500, 1500]; // in paise
    let amount = rewardAmounts[slot];
    ignore WalletLib.addFunds(wallets, transactions, caller, amount, "Spin wheel reward");
    EngagementLib.addEngagementLog(engagementLogs, nextEngagementLogId, caller, #spinWheel, amount);
    nextEngagementLogId += 1;
    amount;
  };

  // --- Referrals ---

  public shared ({ caller }) func createReferral(referredUserId : Principal) : async EngagementTypes.ReferralPublic {
    if (caller == referredUserId) { Runtime.trap("Cannot refer yourself") };
    let rewardConfig = EngagementLib.getActiveRewardByType(walletRewards, #referral);
    let commissionPct = switch (rewardConfig) {
      case (?r) { r.percentageAmount };
      case null { 5.0 }; // default 5%
    };
    let r = EngagementLib.addReferral(referrals, nextReferralId, caller, referredUserId, commissionPct);
    nextReferralId += 1;
    EngagementLib.toReferralPublic(r);
  };

  public shared query ({ caller }) func getMyReferrals() : async [EngagementTypes.ReferralPublic] {
    EngagementLib.getUserReferrals(referrals, caller);
  };

  // --- Coupons ---

  public query func validateCoupon(code : Text, serviceId : Common.ServiceId) : async ?Float {
    EngagementLib.validateCoupon(coupons, code, serviceId);
  };

  public shared query ({ caller }) func listMyCoupons() : async [EngagementTypes.CouponPublic] {
    // Return public active coupons (user can see all active ones)
    coupons.filter(func(c) { c.isActive })
      .map<EngagementTypes.Coupon, EngagementTypes.CouponPublic>(func(c) { EngagementLib.toCouponPublic(c) })
      .toArray();
  };

  // Admin: add coupon
  public shared ({ caller }) func adminAddCoupon(
    code : Text,
    discountPercentage : Float,
    maxUsageCount : Nat,
    expiryDate : Common.Timestamp,
    applicableServices : [Common.ServiceId],
  ) : async EngagementTypes.CouponPublic {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let c = EngagementLib.addCoupon(coupons, nextCouponId, code, discountPercentage, maxUsageCount, expiryDate, applicableServices);
    nextCouponId += 1;
    EngagementLib.toCouponPublic(c);
  };

  // --- Reviews ---

  public shared ({ caller }) func submitReview(
    serviceId : Common.ServiceId,
    rating : Nat,
    comment : Text,
  ) : async EngagementTypes.ReviewPublic {
    let r = EngagementLib.addReview(reviews, nextReviewId, caller, serviceId, rating, comment);
    nextReviewId += 1;
    EngagementLib.toReviewPublic(r);
  };

  public query func getServiceReviews(serviceId : Common.ServiceId, limit : Nat) : async [EngagementTypes.ReviewPublic] {
    EngagementLib.getApprovedReviews(reviews, ?serviceId, limit);
  };

  public query func getAllApprovedReviews(limit : Nat) : async [EngagementTypes.ReviewPublic] {
    EngagementLib.getApprovedReviews(reviews, null, limit);
  };

  // Admin: approve review
  public shared ({ caller }) func adminApproveReview(reviewId : Nat, displayOrder : Nat) : async () {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    reviews.mapInPlace(func(r) {
      if (r.id == reviewId) {
        r.adminApproved := true;
        r.displayOrder := displayOrder;
        r;
      } else { r };
    });
  };

  // --- Admin Pricing Rules ---

  public shared query ({ caller }) func adminGetPricingRules() : async [EngagementTypes.AdminPricingRulePublic] {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    pricingRules.map<EngagementTypes.AdminPricingRule, EngagementTypes.AdminPricingRulePublic>(
      func(r) { EngagementLib.toPricingRulePublic(r) }
    ).toArray();
  };

  public shared ({ caller }) func adminAddPricingRule(
    targetServices : [Common.ServiceId],
    basicMargin : Float,
    recommendedMargin : Float,
    premiumMargin : Float,
    currencyOverrides : [(Text, Float)],
  ) : async EngagementTypes.AdminPricingRulePublic {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let rule = EngagementLib.addPricingRule(
      pricingRules, nextPricingRuleId, targetServices,
      basicMargin, recommendedMargin, premiumMargin, currencyOverrides,
    );
    nextPricingRuleId += 1;
    EngagementLib.toPricingRulePublic(rule);
  };

  // Get effective prices for a service (basic/recommended/premium) in INR paise
  public query func getServicePricing(
    basePriceINR : Nat,
    serviceId : Common.ServiceId,
  ) : async (Float, Float, Float) {
    let (bm, rm, pm) = EngagementLib.getEffectiveMargins(pricingRules, serviceId);
    let basicINR = basePriceINR.toFloat() * bm;
    let recommendedINR = basePriceINR.toFloat() * rm;
    let premiumINR = basePriceINR.toFloat() * pm;
    (basicINR, recommendedINR, premiumINR);
  };

  // --- Engagement Logs ---

  public shared query ({ caller }) func getMyEngagementHistory(limit : Nat) : async [EngagementTypes.EngagementLog] {
    EngagementLib.getUserEngagementLogs(engagementLogs, caller, limit);
  };

  // --- Wallet Reward Config (Admin) ---

  public shared ({ caller }) func adminUpdateWalletReward(
    rewardId : Nat,
    amount : ?Nat,
    percentageAmount : ?Float,
    isActive : ?Bool,
  ) : async () {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    walletRewards.mapInPlace(func(r) {
      if (r.id == rewardId) {
        switch (amount) { case (?a) { r.amount := a }; case null {} };
        switch (percentageAmount) { case (?p) { r.percentageAmount := p }; case null {} };
        switch (isActive) { case (?a) { r.isActive := a }; case null {} };
        r;
      } else { r };
    });
  };

  public shared query ({ caller }) func adminGetWalletRewards() : async [EngagementTypes.WalletRewardPublic] {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    walletRewards.map<EngagementTypes.WalletReward, EngagementTypes.WalletRewardPublic>(
      func(r) { EngagementLib.toWalletRewardPublic(r) }
    ).toArray();
  };
};
