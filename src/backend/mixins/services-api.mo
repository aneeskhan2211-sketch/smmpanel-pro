import Common "../types/common";
import Types "../types/services";
import UserTypes "../types/users";
import ServiceLib "../lib/services";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  services : List.List<Types.Service>,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  var nextServiceId : Nat = 16; // starts at 16 (15 seeded)

  // Get all active services
  public query func listServices() : async [Types.ServicePublic] {
    ServiceLib.listServices(services);
  };

  // Filter by platform
  public query func getServicesByPlatform(platform : Types.Platform) : async [Types.ServicePublic] {
    ServiceLib.filterByPlatform(services, platform);
  };

  // Sort services
  public query func getServicesSorted(sortBy : Types.ServiceSort) : async [Types.ServicePublic] {
    ServiceLib.filterBySort(services, sortBy);
  };

  // Text search
  public query func searchServices(searchTerm : Text) : async [Types.ServicePublic] {
    ServiceLib.searchByName(services, searchTerm);
  };

  // Admin: add service
  public shared ({ caller }) func adminAddService(
    name : Text,
    platform : Types.Platform,
    pricePerThousand : Nat,
    minQuantity : Nat,
    maxQuantity : Nat,
    deliveryTimeHours : Nat,
    hasRefill : Bool,
    qualityRating : Nat,
    reliabilityScore : Nat,
  ) : async Types.ServicePublic {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let svc = ServiceLib.addService(
      services, nextServiceId, name, platform,
      pricePerThousand, minQuantity, maxQuantity,
      deliveryTimeHours, hasRefill, qualityRating, reliabilityScore,
    );
    nextServiceId += 1;
    ServiceLib.toPublic(svc);
  };

  // Admin: update service
  public shared ({ caller }) func adminUpdateService(
    serviceId : Common.ServiceId,
    name : Text,
    pricePerThousand : Nat,
    isActive : Bool,
  ) : async () {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    ServiceLib.updateService(services, serviceId, name, pricePerThousand, isActive);
  };
};
