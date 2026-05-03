import Common "common";

module {
  public type OrderStatus = {
    #pending;
    #processing;
    #completed;
    #failed;
    #refunded;
  };

  public type Order = {
    id : Common.OrderId;
    userId : Common.UserId;
    serviceId : Common.ServiceId;
    var link : Text;
    quantity : Nat;
    totalPrice : Nat;
    var status : OrderStatus;
    createdAt : Common.Timestamp;
    estimatedDelivery : Common.Timestamp;
    var completedAt : ?Common.Timestamp;
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type OrderPublic = {
    id : Common.OrderId;
    userId : Common.UserId;
    serviceId : Common.ServiceId;
    link : Text;
    quantity : Nat;
    totalPrice : Nat;
    status : OrderStatus;
    createdAt : Common.Timestamp;
    estimatedDelivery : Common.Timestamp;
    completedAt : ?Common.Timestamp;
  };

  public type PlaceOrderRequest = {
    serviceId : Common.ServiceId;
    link : Text;
    quantity : Nat;
  };
};
