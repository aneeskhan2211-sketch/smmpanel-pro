import Common "../types/common";
import OrderTypes "../types/orders";
import WalletTypes "../types/wallet";
import ServiceTypes "../types/services";
import UserTypes "../types/users";
import OrderLib "../lib/orders";
import WalletLib "../lib/wallet";
import NotifLib "../lib/notifications";
import NotifTypes "../types/notifications";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  orders : List.List<OrderTypes.Order>,
  wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
  transactions : List.List<WalletTypes.Transaction>,
  services : List.List<ServiceTypes.Service>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  notifications : List.List<NotifTypes.Notification>,
) {
  var ordersNextNotifId : Nat = 1;
  // Place a new order (deducts from wallet)
  public shared ({ caller }) func placeOrder(req : OrderTypes.PlaceOrderRequest) : async OrderTypes.OrderPublic {
    let order = OrderLib.placeOrder(
      orders, wallets, transactions, services, caller, req,
    );
    NotifLib.createNotification(
      notifications, ordersNextNotifId, caller, #order_update,
      "Order #" # order.id.toText() # " placed successfully.",
    );
    ordersNextNotifId += 1;
    OrderLib.toPublic(order);
  };

  // Get own orders
  public shared query ({ caller }) func getMyOrders() : async [OrderTypes.OrderPublic] {
    OrderLib.getOrdersByUser(orders, caller);
  };

  // Get single order by id (owner or admin)
  public shared query ({ caller }) func getOrderById(orderId : Common.OrderId) : async ?OrderTypes.OrderPublic {
    switch (OrderLib.getOrderById(orders, orderId)) {
      case null { null };
      case (?o) {
        let isOwner = Principal.equal(o.userId, caller);
        let isAdmin = switch (users.get(caller)) {
          case (?u) { u.role == #admin };
          case null { false };
        };
        if (isOwner or isAdmin) { ?OrderLib.toPublic(o) } else { null };
      };
    };
  };

  // Cancel own pending order (triggers refund)
  public shared ({ caller }) func cancelOrder(orderId : Common.OrderId) : async () {
    OrderLib.cancelOrder(orders, wallets, transactions, caller, orderId);
    NotifLib.createNotification(
      notifications, ordersNextNotifId, caller, #wallet_alert,
      "Order #" # orderId.toText() # " cancelled. Refund processed.",
    );
    ordersNextNotifId += 1;
  };

  // Admin: update order status
  public shared ({ caller }) func adminUpdateOrderStatus(orderId : Common.OrderId, newStatus : OrderTypes.OrderStatus) : async () {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    OrderLib.updateOrderStatus(orders, orderId, newStatus);
    // If failed, trigger refund
    switch (newStatus) {
      case (#failed) {
        switch (OrderLib.getOrderById(orders, orderId)) {
          case (?o) {
            ignore WalletLib.refundFunds(
              wallets, transactions, o.userId,
              o.totalPrice, "Refund for failed order #" # orderId.toText(),
            );
            NotifLib.createNotification(
              notifications, ordersNextNotifId, o.userId, #wallet_alert,
              "Order #" # orderId.toText() # " failed. Refund processed.",
            );
            ordersNextNotifId += 1;
          };
          case null {};
        };
      };
      case _ {};
    };
  };

  // Admin: list all orders
  public shared query ({ caller }) func adminListOrders() : async [OrderTypes.OrderPublic] {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    OrderLib.listAllOrders(orders);
  };
};
