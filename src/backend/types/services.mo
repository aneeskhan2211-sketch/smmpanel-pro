import Common "common";

module {
  public type Platform = {
    #instagram;
    #youtube;
    #tiktok;
    #facebook;
    #twitter;
    #telegram;
    #website;
    #business;
    #ai;
  };

  public type ServiceSort = { #cheapest; #fastest; #best };

  public type RefillPolicy = { #none; #limited; #guaranteed };

  public type Service = {
    id : Common.ServiceId;
    var name : Text;
    var platform : Platform;
    var pricePerThousand : Nat; // base price in INR paise
    var minQuantity : Nat;
    var maxQuantity : Nat;
    var deliveryTimeHours : Nat;
    var hasRefill : Bool;
    var qualityRating : Nat; // 1-5
    var reliabilityScore : Nat; // 0-100
    var isActive : Bool;
    // --- Pricing tier fields ---
    var baseCost : Nat;          // provider cost in INR paise
    var basicPrice : Nat;        // per 1000 in INR paise
    var recommendedPrice : Nat;  // per 1000 in INR paise
    var premiumPrice : Nat;      // per 1000 in INR paise
    var successRate : Nat;       // 0-100
    var retentionScore : Nat;    // 0-100
    var refillPolicy : RefillPolicy;
    var currencyPrices : [(Text, Float)]; // [(currencyCode, pricePerThousand)]
    var providerId : ?Nat;
    var urgencySignal : Text;    // e.g. "High demand today"
    var category : Text;         // e.g. "followers", "views"
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type ServicePublic = {
    id : Common.ServiceId;
    name : Text;
    platform : Platform;
    pricePerThousand : Nat;
    minQuantity : Nat;
    maxQuantity : Nat;
    deliveryTimeHours : Nat;
    hasRefill : Bool;
    qualityRating : Nat;
    reliabilityScore : Nat;
    isActive : Bool;
    baseCost : Nat;
    basicPrice : Nat;
    recommendedPrice : Nat;
    premiumPrice : Nat;
    successRate : Nat;
    retentionScore : Nat;
    refillPolicy : RefillPolicy;
    currencyPrices : [(Text, Float)];
    providerId : ?Nat;
    urgencySignal : Text;
    category : Text;
  };
};
