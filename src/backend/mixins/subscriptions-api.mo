import Common "../types/common";
import Types "../types/subscriptions";
import SubLib "../lib/subscriptions";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  plans : List.List<Types.SubscriptionPlan>,
  subscriptions : Map.Map<Common.UserId, Types.UserSubscription>,
) {
  // Get all available plans
  public query func getSubscriptionPlans() : async [Types.SubscriptionPlan] {
    SubLib.getPlans(plans);
  };

  // Get own active subscription
  public shared query ({ caller }) func getMySubscription() : async ?Types.UserSubscriptionPublic {
    SubLib.getUserSubscription(subscriptions, caller);
  };

  // Subscribe to a plan
  public shared ({ caller }) func subscribeToPlan(planId : Common.SubscriptionPlanId, autoRenew : Bool) : async Types.UserSubscriptionPublic {
    let sub = SubLib.subscribeToPlan(subscriptions, plans, caller, planId, autoRenew);
    SubLib.toPublic(sub);
  };

  // Cancel own subscription
  public shared ({ caller }) func cancelMySubscription() : async () {
    SubLib.cancelSubscription(subscriptions, caller);
  };
};
