import Common "../types/common";
import Types "../types/users";
import OrderTypes "../types/orders";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func toPublic(user : Types.User) : Types.UserPublic {
    {
      id = user.id;
      username = user.username;
      email = user.email;
      avatar = user.avatar;
      createdAt = user.createdAt;
      role = user.role;
    };
  };

  public func getOrCreateUser(
    users : Map.Map<Common.UserId, Types.User>,
    caller : Common.UserId,
    username : Text,
    email : Text,
  ) : Types.UserPublic {
    switch (users.get(caller)) {
      case (?existing) { toPublic(existing) };
      case null {
        let user : Types.User = {
          id = caller;
          var username = caller.toText();
          var email = email;
          var avatar = null;
          createdAt = Time.now();
          var role = #user;
        };
        users.add(caller, user);
        toPublic(user);
      };
    };
  };

  public func getUser(
    users : Map.Map<Common.UserId, Types.User>,
    userId : Common.UserId,
  ) : ?Types.UserPublic {
    switch (users.get(userId)) {
      case (?user) { ?toPublic(user) };
      case null { null };
    };
  };

  public func updateProfile(
    users : Map.Map<Common.UserId, Types.User>,
    caller : Common.UserId,
    username : Text,
    email : Text,
    avatar : ?Text,
  ) : Types.UserPublic {
    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    user.username := username;
    user.email := email;
    user.avatar := avatar;
    toPublic(user);
  };

  public func getUserStats(
    users : Map.Map<Common.UserId, Types.User>,
    orders : List.List<OrderTypes.Order>,
    userId : Common.UserId,
  ) : Types.UserStats {
    var total = 0;
    var active = 0;
    var completed = 0;
    var spend = 0;
    orders.forEach(func(o) {
      if (Principal.equal(o.userId, userId)) {
        total += 1;
        spend += o.totalPrice;
        switch (o.status) {
          case (#pending) { active += 1 };
          case (#processing) { active += 1 };
          case (#completed) { completed += 1 };
          case _ {};
        };
      };
    });
    { totalOrders = total; activeOrders = active; completedOrders = completed; totalSpend = spend };
  };

  public func listUsers(
    users : Map.Map<Common.UserId, Types.User>,
  ) : [Types.UserPublic] {
    let result = List.empty<Types.UserPublic>();
    users.forEach(func(_, u) { result.add(toPublic(u)) });
    result.toArray();
  };

  public func setUserRole(
    users : Map.Map<Common.UserId, Types.User>,
    caller : Common.UserId,
    targetId : Common.UserId,
    role : Types.UserRole,
  ) : () {
    let user = switch (users.get(targetId)) {
      case (?u) { u };
      case null { Runtime.trap("Target user not found") };
    };
    user.role := role;
  };
};
