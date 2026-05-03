import Common "../types/common";
import TierTypes "../types/tiers";
import UserTypes "../types/users";
import TierLib "../lib/tiers";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  tiers : List.List<TierTypes.ServiceTier>,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  var nextTierId : Nat = 4; // 3 seeded

  // List all active tiers
  public query func listServiceTiers() : async [TierTypes.ServiceTierPublic] {
    TierLib.listTiers(tiers);
  };

  // Admin: update tier margins / features
  public shared ({ caller }) func adminUpdateTier(
    tierId : Nat,
    marginMultiplier : ?Float,
    deliveryMultiplier : ?Float,
    features : ?[Text],
    isActive : ?Bool,
  ) : async Bool {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    TierLib.updateTier(tiers, tierId, marginMultiplier, deliveryMultiplier, features, isActive);
  };

  // Calculate price for a service under a tier
  public query func calculateTierPrice(basePrice : Nat, tierId : Nat) : async ?Nat {
    switch (tiers.find(func(t) { t.id == tierId })) {
      case (?tier) { ?TierLib.calculateTierPrice(basePrice, tier) };
      case null { null };
    };
  };
};
