import TierTypes "../types/tiers";
import List "mo:core/List";

module {
  public func toPublic(t : TierTypes.ServiceTier) : TierTypes.ServiceTierPublic {
    {
      id = t.id;
      name = t.name;
      displayName = t.displayName;
      badge = t.badge;
      description = t.description;
      marginMultiplier = t.marginMultiplier;
      deliveryMultiplier = t.deliveryMultiplier;
      refillGuarantee = t.refillGuarantee;
      priorityProcessing = t.priorityProcessing;
      supportLevel = t.supportLevel;
      features = t.features;
      isActive = t.isActive;
    };
  };

  public func listTiers(tiers : List.List<TierTypes.ServiceTier>) : [TierTypes.ServiceTierPublic] {
    tiers.filter(func(t) { t.isActive })
      .map<TierTypes.ServiceTier, TierTypes.ServiceTierPublic>(func(t) { toPublic(t) })
      .toArray();
  };

  public func addTier(
    tiers : List.List<TierTypes.ServiceTier>,
    nextId : Nat,
    name : TierTypes.TierName,
    displayName : Text,
    badge : Text,
    description : Text,
    marginMultiplier : Float,
    deliveryMultiplier : Float,
    refillGuarantee : Bool,
    priorityProcessing : Bool,
    supportLevel : TierTypes.SupportLevel,
    features : [Text],
  ) : TierTypes.ServiceTier {
    let tier : TierTypes.ServiceTier = {
      id = nextId;
      var name = name;
      var displayName = displayName;
      var badge = badge;
      var description = description;
      var marginMultiplier = marginMultiplier;
      var deliveryMultiplier = deliveryMultiplier;
      var refillGuarantee = refillGuarantee;
      var priorityProcessing = priorityProcessing;
      var supportLevel = supportLevel;
      var features = features;
      var isActive = true;
    };
    tiers.add(tier);
    tier;
  };

  public func updateTier(
    tiers : List.List<TierTypes.ServiceTier>,
    tierId : Nat,
    marginMultiplier : ?Float,
    deliveryMultiplier : ?Float,
    features : ?[Text],
    isActive : ?Bool,
  ) : Bool {
    var found = false;
    tiers.mapInPlace(func(t) {
      if (t.id == tierId) {
        found := true;
        switch (marginMultiplier) { case (?m) { t.marginMultiplier := m }; case null {} };
        switch (deliveryMultiplier) { case (?d) { t.deliveryMultiplier := d }; case null {} };
        switch (features) { case (?f) { t.features := f }; case null {} };
        switch (isActive) { case (?a) { t.isActive := a }; case null {} };
        t;
      } else { t };
    });
    found;
  };

  // Calculate tier price from base price
  public func calculateTierPrice(basePrice : Nat, tier : TierTypes.ServiceTier) : Nat {
    let multiplied = basePrice.toFloat() * tier.marginMultiplier;
    multiplied.toInt().toNat();
  };
};
