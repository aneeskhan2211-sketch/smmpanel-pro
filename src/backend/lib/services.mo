import Common "../types/common";
import Types "../types/services";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";

module {
  public func toPublic(s : Types.Service) : Types.ServicePublic {
    {
      id = s.id;
      name = s.name;
      platform = s.platform;
      pricePerThousand = s.pricePerThousand;
      minQuantity = s.minQuantity;
      maxQuantity = s.maxQuantity;
      deliveryTimeHours = s.deliveryTimeHours;
      hasRefill = s.hasRefill;
      qualityRating = s.qualityRating;
      reliabilityScore = s.reliabilityScore;
      isActive = s.isActive;
      baseCost = s.baseCost;
      basicPrice = s.basicPrice;
      recommendedPrice = s.recommendedPrice;
      premiumPrice = s.premiumPrice;
      successRate = s.successRate;
      retentionScore = s.retentionScore;
      refillPolicy = s.refillPolicy;
      currencyPrices = s.currencyPrices;
      providerId = s.providerId;
      urgencySignal = s.urgencySignal;
      category = s.category;
    };
  };

  public func listServices(
    services : List.List<Types.Service>,
  ) : [Types.ServicePublic] {
    services.filter(func(s) { s.isActive }).map<Types.Service, Types.ServicePublic>(func(s) { toPublic(s) }).toArray();
  };

  public func filterByPlatform(
    services : List.List<Types.Service>,
    platform : Types.Platform,
  ) : [Types.ServicePublic] {
    services.filter(func(s) { s.isActive and s.platform == platform })
      .map<Types.Service, Types.ServicePublic>(func(s) { toPublic(s) }).toArray();
  };

  public func filterBySort(
    services : List.List<Types.Service>,
    sortBy : Types.ServiceSort,
  ) : [Types.ServicePublic] {
    let active = services.filter(func(s) { s.isActive });
    let sorted = switch (sortBy) {
      case (#cheapest) {
        active.sort(func(a, b) {
          if (a.pricePerThousand < b.pricePerThousand) { #less }
          else if (a.pricePerThousand > b.pricePerThousand) { #greater }
          else { #equal };
        });
      };
      case (#fastest) {
        active.sort(func(a, b) {
          if (a.deliveryTimeHours < b.deliveryTimeHours) { #less }
          else if (a.deliveryTimeHours > b.deliveryTimeHours) { #greater }
          else { #equal };
        });
      };
      case (#best) {
        active.sort(func(a, b) {
          if (a.qualityRating > b.qualityRating) { #less }
          else if (a.qualityRating < b.qualityRating) { #greater }
          else { #equal };
        });
      };
    };
    sorted.map<Types.Service, Types.ServicePublic>(func(s) { toPublic(s) }).toArray();
  };

  public func searchByName(
    services : List.List<Types.Service>,
    searchTerm : Text,
  ) : [Types.ServicePublic] {
    let lower = searchTerm.toLower();
    services.filter(func(s) { s.isActive and s.name.toLower().contains(#text lower) })
      .map<Types.Service, Types.ServicePublic>(func(s) { toPublic(s) }).toArray();
  };

  public func getService(
    services : List.List<Types.Service>,
    serviceId : Common.ServiceId,
  ) : ?Types.Service {
    services.find(func(s) { s.id == serviceId });
  };

  public func addService(
    services : List.List<Types.Service>,
    nextId : Nat,
    name : Text,
    platform : Types.Platform,
    pricePerThousand : Nat,
    minQuantity : Nat,
    maxQuantity : Nat,
    deliveryTimeHours : Nat,
    hasRefill : Bool,
    qualityRating : Nat,
    reliabilityScore : Nat,
  ) : Types.Service {
    // Derive tier prices: basic = pricePerThousand, recommended = +25%, premium = +87.5% of basic
    let basicPrice = pricePerThousand;
    let recommendedPrice = Int.abs((pricePerThousand.toFloat() * 1.25).toInt());
    let premiumPrice = Int.abs((pricePerThousand.toFloat() * 1.875).toInt());
    let baseCost = Int.abs((pricePerThousand.toFloat() * 0.65).toInt()); // ~65% of basic
    let svc : Types.Service = {
      id = nextId;
      var name = name;
      var platform = platform;
      var pricePerThousand = pricePerThousand;
      var minQuantity = minQuantity;
      var maxQuantity = maxQuantity;
      var deliveryTimeHours = deliveryTimeHours;
      var hasRefill = hasRefill;
      var qualityRating = qualityRating;
      var reliabilityScore = reliabilityScore;
      var isActive = true;
      var baseCost = baseCost;
      var basicPrice = basicPrice;
      var recommendedPrice = recommendedPrice;
      var premiumPrice = premiumPrice;
      var successRate = reliabilityScore;
      var retentionScore = qualityRating * 20; // map 1-5 to 20-100
      var refillPolicy = if (hasRefill) { #guaranteed } else { #none };
      var currencyPrices = [];
      var providerId = null;
      var urgencySignal = "";
      var category = "";
    };
    services.add(svc);
    svc;
  };

  public func updateService(
    services : List.List<Types.Service>,
    serviceId : Common.ServiceId,
    name : Text,
    pricePerThousand : Nat,
    isActive : Bool,
  ) : () {
    services.mapInPlace(func(s) {
      if (s.id == serviceId) {
        s.name := name;
        s.pricePerThousand := pricePerThousand;
        s.isActive := isActive;
        s;
      } else { s };
    });
  };
};
