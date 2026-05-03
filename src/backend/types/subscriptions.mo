import Common "common";

module {
  public type PlanTier = { #free; #pro; #premium };

  public type SubscriptionPlan = {
    id : Common.SubscriptionPlanId;
    tier : PlanTier;
    name : Text;
    priceMonthly : Nat;
    discountPercent : Nat;
    features : [Text];
  };

  public type UserSubscription = {
    userId : Common.UserId;
    planId : Common.SubscriptionPlanId;
    var startDate : Common.Timestamp;
    var endDate : Common.Timestamp;
    var isActive : Bool;
    var autoRenew : Bool;
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type UserSubscriptionPublic = {
    userId : Common.UserId;
    planId : Common.SubscriptionPlanId;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    isActive : Bool;
    autoRenew : Bool;
  };
};
