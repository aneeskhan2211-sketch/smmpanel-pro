import Common "common";

module {
  public type UserRole = { #user; #admin };

  public type User = {
    id : Common.UserId;
    var username : Text;
    var email : Text;
    var avatar : ?Text;
    createdAt : Common.Timestamp;
    var role : UserRole;
  };

  public type UserStats = {
    totalOrders : Nat;
    activeOrders : Nat;
    completedOrders : Nat;
    totalSpend : Nat;
  };

  // Shared (immutable) API boundary type
  public type UserPublic = {
    id : Common.UserId;
    username : Text;
    email : Text;
    avatar : ?Text;
    createdAt : Common.Timestamp;
    role : UserRole;
  };
};
