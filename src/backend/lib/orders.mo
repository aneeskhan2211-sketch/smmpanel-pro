import Common "../types/common";
import OrderTypes "../types/orders";
import WalletTypes "../types/wallet";
import ServiceTypes "../types/services";
import WalletLib "wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public func toPublic(o : OrderTypes.Order) : OrderTypes.OrderPublic {
    {
      id = o.id;
      userId = o.userId;
      serviceId = o.serviceId;
      link = o.link;
      quantity = o.quantity;
      totalPrice = o.totalPrice;
      status = o.status;
      createdAt = o.createdAt;
      estimatedDelivery = o.estimatedDelivery;
      completedAt = o.completedAt;
    };
  };

  public func placeOrder(
    orders : List.List<OrderTypes.Order>,
    wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
    transactions : List.List<WalletTypes.Transaction>,
    services : List.List<ServiceTypes.Service>,
    caller : Common.UserId,
    req : OrderTypes.PlaceOrderRequest,
  ) : OrderTypes.Order {
    let svc = switch (services.find(func(s) { s.id == req.serviceId and s.isActive })) {
      case (?s) { s };
      case null { Runtime.trap("Service not found or inactive") };
    };
    if (req.quantity < svc.minQuantity or req.quantity > svc.maxQuantity) {
      Runtime.trap("Quantity out of range");
    };
    let totalPrice = (req.quantity * svc.pricePerThousand) / 1000;
    let balance = WalletLib.getBalance(wallets, caller);
    if (balance < totalPrice) { Runtime.trap("Insufficient wallet balance") };
    ignore WalletLib.deductFunds(wallets, transactions, caller, totalPrice, "Order #" # (orders.size() + 1).toText());
    let now = Time.now();
    let order : OrderTypes.Order = {
      id = orders.size() + 1;
      userId = caller;
      serviceId = req.serviceId;
      var link = req.link;
      quantity = req.quantity;
      totalPrice = totalPrice;
      var status = #pending;
      createdAt = now;
      estimatedDelivery = now + (svc.deliveryTimeHours * 3_600_000_000_000 : Int);
      var completedAt = null;
    };
    orders.add(order);
    order;
  };

  public func getOrdersByUser(
    orders : List.List<OrderTypes.Order>,
    userId : Common.UserId,
  ) : [OrderTypes.OrderPublic] {
    orders.filter(func(o) { Principal.equal(o.userId, userId) })
      .map<OrderTypes.Order, OrderTypes.OrderPublic>(func(o) { toPublic(o) })
      .toArray()
      .reverse();
  };

  public func getOrderById(
    orders : List.List<OrderTypes.Order>,
    orderId : Common.OrderId,
  ) : ?OrderTypes.Order {
    orders.find(func(o) { o.id == orderId });
  };

  public func updateOrderStatus(
    orders : List.List<OrderTypes.Order>,
    orderId : Common.OrderId,
    newStatus : OrderTypes.OrderStatus,
  ) : () {
    orders.mapInPlace(func(o) {
      if (o.id == orderId) {
        o.status := newStatus;
        switch (newStatus) {
          case (#completed) { o.completedAt := ?Time.now() };
          case _ {};
        };
        o;
      } else { o };
    });
  };

  public func cancelOrder(
    orders : List.List<OrderTypes.Order>,
    wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
    transactions : List.List<WalletTypes.Transaction>,
    caller : Common.UserId,
    orderId : Common.OrderId,
  ) : () {
    let order = switch (orders.find(func(o) { o.id == orderId })) {
      case (?o) { o };
      case null { Runtime.trap("Order not found") };
    };
    if (not Principal.equal(order.userId, caller)) { Runtime.trap("Not your order") };
    switch (order.status) {
      case (#pending) {};
      case _ { Runtime.trap("Only pending orders can be cancelled") };
    };
    order.status := #refunded;
    ignore WalletLib.refundFunds(wallets, transactions, caller, order.totalPrice, "Refund for cancelled order #" # orderId.toText());
  };

  public func listAllOrders(
    orders : List.List<OrderTypes.Order>,
  ) : [OrderTypes.OrderPublic] {
    orders.map<OrderTypes.Order, OrderTypes.OrderPublic>(func(o) { toPublic(o) }).toArray().reverse();
  };
};
