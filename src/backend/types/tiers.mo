import Common "common";

module {
  public type TierName = { #basic; #recommended; #premium };
  public type SupportLevel = { #standard; #priority; #dedicated };

  public type ServiceTier = {
    id : Nat;
    var name : TierName;
    var displayName : Text;
    var badge : Text;
    var description : Text;
    var marginMultiplier : Float; // e.g. 1.0 for basic, 1.25 for recommended, 1.875 for premium
    var deliveryMultiplier : Float; // >1.0 = faster
    var refillGuarantee : Bool;
    var priorityProcessing : Bool;
    var supportLevel : SupportLevel;
    var features : [Text];
    var isActive : Bool;
  };

  // Shared-safe for API boundary
  public type ServiceTierPublic = {
    id : Nat;
    name : TierName;
    displayName : Text;
    badge : Text;
    description : Text;
    marginMultiplier : Float;
    deliveryMultiplier : Float;
    refillGuarantee : Bool;
    priorityProcessing : Bool;
    supportLevel : SupportLevel;
    features : [Text];
    isActive : Bool;
  };
};
