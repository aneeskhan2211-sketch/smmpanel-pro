import Common "../types/common";
import AdminTypes "../types/admin";
import UserTypes "../types/users";
import OrderTypes "../types/orders";
import WalletTypes "../types/wallet";
import AdminLib "../lib/admin";
import WalletLib "../lib/wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Int "mo:core/Int";
import ServiceTypes "../types/services";

mixin (
  users : Map.Map<Common.UserId, UserTypes.User>,
  orders : List.List<OrderTypes.Order>,
  wallets : Map.Map<Common.UserId, WalletTypes.Wallet>,
  transactions : List.List<WalletTypes.Transaction>,
  services : List.List<ServiceTypes.Service>,
  providers : List.List<AdminTypes.Provider>,
  logs : List.List<AdminTypes.SystemLog>,
  fraudAlerts : List.List<AdminTypes.FraudAlert>,
  adminConfig : { var value : AdminTypes.AdminConfig },
) {
  var adminNextLogId : Nat = 1;
  var adminNextProviderId : Nat = 1;
  var adminNextAlertId : Nat = 1;

  func requireAdmin(caller : Principal) : UserTypes.User {
    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (user.role != #admin) { Runtime.trap("Admin only") };
    user;
  };

  // Dashboard stats
  public shared query ({ caller }) func adminGetDashboardStats() : async AdminTypes.DashboardStats {
    ignore requireAdmin(caller);
    AdminLib.getDashboardStats(orders, users, services, adminConfig.value);
  };

  // All orders with pagination and optional status filter
  public shared query ({ caller }) func adminGetAllOrders(statusFilter : ?Text, limit : Nat, offset : Nat) : async [OrderTypes.OrderPublic] {
    ignore requireAdmin(caller);
    AdminLib.getAllOrders(orders, statusFilter, limit, offset);
  };

  // Manually update order fields
  public shared ({ caller }) func adminUpdateOrderManual(
    orderId : Nat,
    newStatus : ?Text,
    newPrice : ?Float,
    newQuantity : ?Nat,
    reason : Text,
  ) : async () {
    ignore requireAdmin(caller);
    orders.mapInPlace(func(o) {
      if (o.id == orderId) {
        switch (newStatus) {
          case (?s) {
            if (s == "pending") { o.status := #pending }
            else if (s == "processing") { o.status := #processing }
            else if (s == "completed") { o.status := #completed; o.completedAt := ?Time.now() }
            else if (s == "failed") { o.status := #failed }
            else if (s == "refunded") { o.status := #refunded };
          };
          case null {};
        };
        switch (newQuantity) {
          case (?_q) { /* quantity is immutable, skip */ };
          case null {};
        };
        o;
      } else { o };
    });
    AdminLib.addLog(
      logs, adminNextLogId, "order_manual_update",
      caller.toText(), "order", orderId.toText(),
      "Reason: " # reason, #success,
    );
    adminNextLogId += 1;
  };

  // Cancel order and refund
  public shared ({ caller }) func adminCancelOrder(orderId : Nat, reason : Text) : async () {
    ignore requireAdmin(caller);
    let order = switch (orders.find(func(o) { o.id == orderId })) {
      case (?o) { o };
      case null { Runtime.trap("Order not found") };
    };
    orders.mapInPlace(func(o) {
      if (o.id == orderId) { o.status := #refunded; o }  else { o };
    });
    ignore WalletLib.refundFunds(
      wallets, transactions, order.userId,
      order.totalPrice, "Admin cancel refund for order #" # orderId.toText(),
    );
    AdminLib.addLog(
      logs, adminNextLogId, "order_cancel",
      caller.toText(), "order", orderId.toText(),
      "Reason: " # reason, #success,
    );
    adminNextLogId += 1;
  };

  // All users with pagination and filters
  public shared query ({ caller }) func adminGetAllUsers(statusFilter : ?Text, tierFilter : ?Text, limit : Nat, offset : Nat) : async [UserTypes.UserPublic] {
    ignore requireAdmin(caller);
    AdminLib.getAllUsers(users, statusFilter, tierFilter, limit, offset);
  };

  // Ban a user
  public shared ({ caller }) func adminBanUser(userId : Principal, reason : Text) : async () {
    ignore requireAdmin(caller);
    let target = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };
    // Demote to user role as a ban marker (no separate isBanned field)
    target.role := #user;
    AdminLib.addLog(
      logs, adminNextLogId, "user_ban",
      caller.toText(), "user", userId.toText(),
      "Reason: " # reason, #success,
    );
    adminNextLogId += 1;
  };

  // Manually adjust user wallet
  public shared ({ caller }) func adminAdjustUserWallet(userId : Principal, amount : Float, reason : Text, isCredit : Bool) : async () {
    ignore requireAdmin(caller);
    let amountNat = Int.abs(amount.toInt());
    if (isCredit) {
      ignore WalletLib.addFunds(wallets, transactions, userId, amountNat, "Admin credit: " # reason);
    } else {
      ignore WalletLib.deductFunds(wallets, transactions, userId, amountNat, "Admin debit: " # reason);
    };
    AdminLib.addLog(
      logs, adminNextLogId, if (isCredit) { "wallet_credit" } else { "wallet_debit" },
      caller.toText(), "user", userId.toText(),
      "Amount: " # debug_show(amount) # " Reason: " # reason, #success,
    );
    adminNextLogId += 1;
  };

  // Service stats
  public shared query ({ caller }) func adminGetServiceStats() : async [AdminTypes.ServiceStat] {
    ignore requireAdmin(caller);
    AdminLib.getServiceStats(orders, services, adminConfig.value);
  };

  // Update service visibility
  public shared ({ caller }) func adminUpdateServiceVisibility(serviceId : Nat, visible : Bool) : async () {
    ignore requireAdmin(caller);
    services.mapInPlace(func(s) {
      if (s.id == serviceId) { s.isActive := visible; s } else { s };
    });
    AdminLib.addLog(
      logs, adminNextLogId, "service_visibility",
      caller.toText(), "service", serviceId.toText(),
      "Visible: " # debug_show(visible), #success,
    );
    adminNextLogId += 1;
  };

  // Batch update service prices by percentage
  public shared ({ caller }) func adminBatchUpdateServicePrices(serviceIds : [Nat], percentageChange : Float) : async () {
    ignore requireAdmin(caller);
    services.mapInPlace(func(s) {
      let shouldUpdate = serviceIds.find(func(id) { id == s.id }) != null;
      if (shouldUpdate) {
        let newPrice = Int.abs((s.pricePerThousand.toFloat() * (1.0 + percentageChange / 100.0)).toInt());
        s.pricePerThousand := newPrice;
        s;
      } else { s };
    });
    AdminLib.addLog(
      logs, adminNextLogId, "service_batch_price",
      caller.toText(), "service", "batch",
      "Change: " # debug_show(percentageChange) # "% on " # serviceIds.size().toText() # " services", #success,
    );
    adminNextLogId += 1;
  };

  // Add provider
  public shared ({ caller }) func adminAddProvider(
    name : Text,
    apiUrl : Text,
    apiKey : Text,
    commissionPercent : Float,
    priority : Nat,
  ) : async AdminTypes.ProviderPublic {
    ignore requireAdmin(caller);
    let p = AdminLib.addProvider(providers, adminNextProviderId, name, apiUrl, apiKey, commissionPercent, priority);
    adminNextProviderId += 1;
    AdminLib.addLog(
      logs, adminNextLogId, "provider_add",
      caller.toText(), "provider", p.id.toText(),
      "Added provider: " # name, #success,
    );
    adminNextLogId += 1;
    AdminLib.toProviderPublic(p);
  };

  // Update provider
  public shared ({ caller }) func adminUpdateProvider(
    providerId : Nat,
    status : ?Text,
    commissionPercent : ?Float,
    priority : ?Nat,
  ) : async () {
    ignore requireAdmin(caller);
    AdminLib.updateProvider(providers, providerId, status, commissionPercent, priority);
    AdminLib.addLog(
      logs, adminNextLogId, "provider_update",
      caller.toText(), "provider", providerId.toText(),
      "Updated provider", #success,
    );
    adminNextLogId += 1;
  };

  // List providers
  public shared query ({ caller }) func adminGetProviders() : async [AdminTypes.ProviderPublic] {
    ignore requireAdmin(caller);
    AdminLib.listProviders(providers);
  };

  // System logs
  public shared query ({ caller }) func adminGetLogs(actionFilter : ?Text, limit : Nat, offset : Nat) : async [AdminTypes.SystemLog] {
    ignore requireAdmin(caller);
    AdminLib.getLogs(logs, actionFilter, limit, offset);
  };

  // Fraud alerts
  public shared query ({ caller }) func adminGetFraudAlerts(resolved : ?Bool, riskLevel : ?Nat, limit : Nat, offset : Nat) : async [AdminTypes.FraudAlertPublic] {
    ignore requireAdmin(caller);
    AdminLib.getFraudAlerts(fraudAlerts, resolved, riskLevel, limit, offset);
  };

  // Resolve fraud alert
  public shared ({ caller }) func adminResolveFraudAlert(alertId : Nat, action : Text) : async () {
    ignore requireAdmin(caller);
    AdminLib.resolveFraudAlert(fraudAlerts, alertId, action);
    AdminLib.addLog(
      logs, adminNextLogId, "fraud_alert_resolve",
      caller.toText(), "fraud_alert", alertId.toText(),
      "Action: " # action, #success,
    );
    adminNextLogId += 1;
  };

  // Get config
  public shared query ({ caller }) func adminGetConfig() : async AdminTypes.AdminConfig {
    ignore requireAdmin(caller);
    adminConfig.value;
  };

  // Update config
  public shared ({ caller }) func adminUpdateConfig(config : AdminTypes.AdminConfig) : async () {
    ignore requireAdmin(caller);
    adminConfig.value := config;
    AdminLib.addLog(
      logs, adminNextLogId, "config_update",
      caller.toText(), "config", "global",
      "Admin config updated", #success,
    );
    adminNextLogId += 1;
  };
};
