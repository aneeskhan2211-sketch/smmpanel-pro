import BundleTypes "../types/bundles";
import List "mo:core/List";

module {
  public func toPublic(b : BundleTypes.Bundle) : BundleTypes.BundlePublic {
    {
      id = b.id;
      name = b.name;
      description = b.description;
      services = b.services;
      originalPrice = b.originalPrice;
      discountedPrice = b.discountedPrice;
      estimatedDeliveryHours = b.estimatedDeliveryHours;
      hasPremiumUpgrade = b.hasPremiumUpgrade;
      isActive = b.isActive;
      badge = b.badge;
      imageEmoji = b.imageEmoji;
    };
  };

  public func listBundles(bundles : List.List<BundleTypes.Bundle>) : [BundleTypes.BundlePublic] {
    bundles.filter(func(b) { b.isActive })
      .map<BundleTypes.Bundle, BundleTypes.BundlePublic>(func(b) { toPublic(b) })
      .toArray();
  };

  public func getBundle(
    bundles : List.List<BundleTypes.Bundle>,
    bundleId : Nat,
  ) : ?BundleTypes.Bundle {
    bundles.find(func(b) { b.id == bundleId });
  };

  public func addBundle(
    bundles : List.List<BundleTypes.Bundle>,
    nextId : Nat,
    name : Text,
    description : Text,
    services : [BundleTypes.BundleService],
    originalPrice : Nat,
    discountedPrice : Nat,
    estimatedDeliveryHours : Nat,
    hasPremiumUpgrade : Bool,
    badge : Text,
    imageEmoji : Text,
  ) : BundleTypes.Bundle {
    let bundle : BundleTypes.Bundle = {
      id = nextId;
      var name = name;
      var description = description;
      var services = services;
      var originalPrice = originalPrice;
      var discountedPrice = discountedPrice;
      var estimatedDeliveryHours = estimatedDeliveryHours;
      var hasPremiumUpgrade = hasPremiumUpgrade;
      var isActive = true;
      var badge = badge;
      var imageEmoji = imageEmoji;
    };
    bundles.add(bundle);
    bundle;
  };

  public func updateBundle(
    bundles : List.List<BundleTypes.Bundle>,
    bundleId : Nat,
    name : ?Text,
    discountedPrice : ?Nat,
    isActive : ?Bool,
  ) : Bool {
    var found = false;
    bundles.mapInPlace(func(b) {
      if (b.id == bundleId) {
        found := true;
        switch (name) { case (?n) { b.name := n }; case null {} };
        switch (discountedPrice) { case (?p) { b.discountedPrice := p }; case null {} };
        switch (isActive) { case (?a) { b.isActive := a }; case null {} };
        b;
      } else { b };
    });
    found;
  };
};
