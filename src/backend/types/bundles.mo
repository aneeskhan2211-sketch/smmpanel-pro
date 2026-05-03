import Common "common";

module {
  public type BundleService = {
    serviceId : Common.ServiceId;
    quantity : Nat;
  };

  public type Bundle = {
    id : Nat;
    var name : Text;
    var description : Text;
    var services : [BundleService];
    var originalPrice : Nat; // in INR paise (x100)
    var discountedPrice : Nat;
    var estimatedDeliveryHours : Nat;
    var hasPremiumUpgrade : Bool;
    var isActive : Bool;
    var badge : Text; // e.g. "Most Popular", "Best Value"
    var imageEmoji : Text;
  };

  public type BundlePublic = {
    id : Nat;
    name : Text;
    description : Text;
    services : [BundleService];
    originalPrice : Nat;
    discountedPrice : Nat;
    estimatedDeliveryHours : Nat;
    hasPremiumUpgrade : Bool;
    isActive : Bool;
    badge : Text;
    imageEmoji : Text;
  };

  public type PlaceBundleOrderRequest = {
    bundleId : Nat;
    link : Text;
    usePremium : Bool;
  };
};
