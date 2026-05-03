import Common "../types/common";
import Types "../types/users";
import OrderTypes "../types/orders";
import UserLib "../lib/users";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  users : Map.Map<Common.UserId, Types.User>,
  orders : List.List<OrderTypes.Order>,
) {
  // Register or get own profile (first login creates user)
  public shared ({ caller }) func registerUser(username : Text, email : Text) : async Types.UserPublic {
    UserLib.getOrCreateUser(users, caller, username, email);
  };

  // Get own profile
  public shared query ({ caller }) func getMyProfile() : async Types.UserPublic {
    switch (UserLib.getUser(users, caller)) {
      case (?u) { u };
      case null { Runtime.trap("Profile not found — call registerUser first") };
    };
  };

  // Update own profile
  public shared ({ caller }) func updateMyProfile(username : Text, email : Text, avatar : ?Text) : async Types.UserPublic {
    UserLib.updateProfile(users, caller, username, email, avatar);
  };

  // Get own stats
  public shared query ({ caller }) func getMyStats() : async Types.UserStats {
    UserLib.getUserStats(users, orders, caller);
  };

  // Admin: list all users
  public shared query ({ caller }) func adminListUsers() : async [Types.UserPublic] {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    UserLib.listUsers(users);
  };

  // Admin: set user role
  public shared ({ caller }) func adminSetUserRole(targetId : Common.UserId, role : Types.UserRole) : async () {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    UserLib.setUserRole(users, caller, targetId, role);
  };
};
