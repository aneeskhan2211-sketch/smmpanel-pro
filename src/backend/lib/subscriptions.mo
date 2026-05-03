import Common "../types/common";
import Types "../types/subscriptions";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  // 30 days in nanoseconds (30 * 24 * 3_600_000_000_000)
  let thirtyDays : Int = 2_592_000_000_000_000;

  public func toPublic(s : Types.UserSubscription) : Types.UserSubscriptionPublic {
    {
      userId = s.userId;
      planId = s.planId;
      startDate = s.startDate;
      endDate = s.endDate;
      isActive = s.isActive;
      autoRenew = s.autoRenew;
    };
  };

  public func getPlans(
    plans : List.List<Types.SubscriptionPlan>,
  ) : [Types.SubscriptionPlan] {
    plans.toArray();
  };

  public func getUserSubscription(
    subscriptions : Map.Map<Common.UserId, Types.UserSubscription>,
    userId : Common.UserId,
  ) : ?Types.UserSubscriptionPublic {
    switch (subscriptions.get(userId)) {
      case (?s) {
        if (s.isActive) { ?toPublic(s) } else { null };
      };
      case null { null };
    };
  };

  public func subscribeToPlan(
    subscriptions : Map.Map<Common.UserId, Types.UserSubscription>,
    plans : List.List<Types.SubscriptionPlan>,
    userId : Common.UserId,
    planId : Common.SubscriptionPlanId,
    autoRenew : Bool,
  ) : Types.UserSubscription {
    let planExists = plans.find(func(p) { p.id == planId });
    switch (planExists) {
      case null { Runtime.trap("Plan not found") };
      case _ {};
    };
    let now = Time.now();
    let endDate = now + thirtyDays;
    switch (subscriptions.get(userId)) {
      case (?sub) {
        sub.startDate := now;
        sub.endDate := endDate;
        sub.isActive := true;
        sub.autoRenew := autoRenew;
        // Replace the stored subscription with updated planId
        let updated : Types.UserSubscription = {
          userId = sub.userId;
          planId = planId;
          var startDate = now;
          var endDate = endDate;
          var isActive = true;
          var autoRenew = autoRenew;
        };
        subscriptions.add(userId, updated);
        updated;
      };
      case null {
        let newSub : Types.UserSubscription = {
          userId = userId;
          planId = planId;
          var startDate = now;
          var endDate = endDate;
          var isActive = true;
          var autoRenew = autoRenew;
        };
        subscriptions.add(userId, newSub);
        newSub;
      };
    };
  };

  public func cancelSubscription(
    subscriptions : Map.Map<Common.UserId, Types.UserSubscription>,
    userId : Common.UserId,
  ) : () {
    switch (subscriptions.get(userId)) {
      case (?s) {
        s.autoRenew := false;
        s.isActive := false;
      };
      case null { Runtime.trap("No active subscription") };
    };
  };
};
