import Common "../types/common";
import BundleTypes "../types/bundles";
import UserTypes "../types/users";
import BundleLib "../lib/bundles";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  bundles : List.List<BundleTypes.Bundle>,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  var nextBundleId : Nat = 6; // 5 seeded

  // List all active bundles
  public query func listBundles() : async [BundleTypes.BundlePublic] {
    BundleLib.listBundles(bundles);
  };

  // Get single bundle
  public query func getBundle(bundleId : Nat) : async ?BundleTypes.BundlePublic {
    switch (BundleLib.getBundle(bundles, bundleId)) {
      case (?b) { ?BundleLib.toPublic(b) };
      case null { null };
    };
  };

  // Admin: add bundle
  public shared ({ caller }) func adminAddBundle(
    name : Text,
    description : Text,
    services : [BundleTypes.BundleService],
    originalPrice : Nat,
    discountedPrice : Nat,
    estimatedDeliveryHours : Nat,
    hasPremiumUpgrade : Bool,
    badge : Text,
    imageEmoji : Text,
  ) : async BundleTypes.BundlePublic {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let b = BundleLib.addBundle(
      bundles, nextBundleId, name, description, services,
      originalPrice, discountedPrice, estimatedDeliveryHours,
      hasPremiumUpgrade, badge, imageEmoji,
    );
    nextBundleId += 1;
    BundleLib.toPublic(b);
  };

  // Admin: update bundle
  public shared ({ caller }) func adminUpdateBundle(
    bundleId : Nat,
    name : ?Text,
    discountedPrice : ?Nat,
    isActive : ?Bool,
  ) : async Bool {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    BundleLib.updateBundle(bundles, bundleId, name, discountedPrice, isActive);
  };
};
