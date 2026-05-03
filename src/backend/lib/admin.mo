import AdminTypes "../types/admin";
import UserTypes "../types/users";
import OrderTypes "../types/orders";
import ServiceTypes "../types/services";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  // --- Provider helpers ---

  public func toProviderPublic(p : AdminTypes.Provider) : AdminTypes.ProviderPublic {
    {
      id = p.id;
      name = p.name;
      apiUrl = p.apiUrl;
      apiKeyMasked = p.apiKeyMasked;
      commissionPercent = p.commissionPercent;
      priority = p.priority;
      status = p.status;
      successRate = p.successRate;
      failedLast24h = p.failedLast24h;
      avgResponseMs = p.avgResponseMs;
    };
  };

  public func addProvider(
    providers : List.List<AdminTypes.Provider>,
    nextId : Nat,
    name : Text,
    apiUrl : Text,
    apiKey : Text,
    commissionPercent : Float,
    priority : Nat,
  ) : AdminTypes.Provider {
    let masked = if (apiKey.size() > 6) {
      "****" # apiKey.size().toText() # "chars"
    } else { "****" };
    let p : AdminTypes.Provider = {
      id = nextId;
      var name = name;
      var apiUrl = apiUrl;
      var apiKeyMasked = masked;
      var commissionPercent = commissionPercent;
      var priority = priority;
      var status = #active;
      var successRate = 100.0;
      var failedLast24h = 0;
      var avgResponseMs = 250;
    };
    providers.add(p);
    p;
  };

  public func listProviders(
    providers : List.List<AdminTypes.Provider>,
  ) : [AdminTypes.ProviderPublic] {
    providers.map<AdminTypes.Provider, AdminTypes.ProviderPublic>(func(p) { toProviderPublic(p) }).toArray();
  };

  public func updateProvider(
    providers : List.List<AdminTypes.Provider>,
    providerId : Nat,
    status : ?Text,
    commissionPercent : ?Float,
    priority : ?Nat,
  ) : () {
    providers.mapInPlace(func(p) {
      if (p.id == providerId) {
        switch (status) {
          case (?s) {
            if (s == "active") { p.status := #active }
            else if (s == "inactive") { p.status := #inactive }
            else if (s == "testing") { p.status := #testing };
          };
          case null {};
        };
        switch (commissionPercent) {
          case (?c) { p.commissionPercent := c };
          case null {};
        };
        switch (priority) {
          case (?pr) { p.priority := pr };
          case null {};
        };
        p;
      } else { p };
    });
  };

  // --- Log helpers ---

  public func addLog(
    logs : List.List<AdminTypes.SystemLog>,
    nextId : Nat,
    action : Text,
    actorId : Text,
    targetType : Text,
    targetId : Text,
    details : Text,
    status : AdminTypes.LogStatus,
  ) : () {
    let log : AdminTypes.SystemLog = {
      id = nextId;
      timestamp = Time.now();
      action = action;
      actorId = actorId;
      targetType = targetType;
      targetId = targetId;
      details = details;
      status = status;
    };
    logs.add(log);
  };

  public func getLogs(
    logs : List.List<AdminTypes.SystemLog>,
    actionFilter : ?Text,
    limit : Nat,
    offset : Nat,
  ) : [AdminTypes.SystemLog] {
    let filtered = switch (actionFilter) {
      case (?f) { logs.filter(func(l) { l.action == f }) };
      case null { logs };
    };
    let arr = filtered.toArray().reverse();
    let start = if (offset >= arr.size()) { return [] } else { offset };
    let end_ = if (start + limit > arr.size()) { arr.size() } else { start + limit };
    arr.sliceToArray(start, end_);
  };

  // --- Fraud alert helpers ---

  public func toFraudAlertPublic(a : AdminTypes.FraudAlert) : AdminTypes.FraudAlertPublic {
    {
      id = a.id;
      timestamp = a.timestamp;
      userId = a.userId;
      alertType = a.alertType;
      riskScore = a.riskScore;
      orderId = a.orderId;
      actionTaken = a.actionTaken;
      resolved = a.resolved;
    };
  };

  public func getFraudAlerts(
    alerts : List.List<AdminTypes.FraudAlert>,
    resolved : ?Bool,
    riskLevel : ?Nat,
    limit : Nat,
    offset : Nat,
  ) : [AdminTypes.FraudAlertPublic] {
    let filtered = alerts.filter(func(a) {
      let resolvedOk = switch (resolved) {
        case (?r) { a.resolved == r };
        case null { true };
      };
      let riskOk = switch (riskLevel) {
        case (?r) { a.riskScore >= r };
        case null { true };
      };
      resolvedOk and riskOk;
    });
    let arr = filtered.map<AdminTypes.FraudAlert, AdminTypes.FraudAlertPublic>(func(a) { toFraudAlertPublic(a) }).toArray().reverse();
    let start = if (offset >= arr.size()) { return [] } else { offset };
    let end_ = if (start + limit > arr.size()) { arr.size() } else { start + limit };
    arr.sliceToArray(start, end_);
  };

  public func resolveFraudAlert(
    alerts : List.List<AdminTypes.FraudAlert>,
    alertId : Nat,
    action : Text,
  ) : () {
    alerts.mapInPlace(func(a) {
      if (a.id == alertId) {
        let newAction : AdminTypes.AlertAction = if (action == "whitelist" or action == "whitelisted") { #whitelisted }
          else if (action == "block" or action == "blocked") { #blocked }
          else { #flagged };
        a.actionTaken := newAction;
        a.resolved := true;
        a;
      } else { a };
    });
  };

  // --- Config helpers ---

  public func defaultConfig() : AdminTypes.AdminConfig {
    {
      globalMarginPercent = 20.0;
      maxOrdersPerUserPerDay = 50;
      maxConcurrentOrdersPerLink = 5;
      minUserAgeDays = 0;
      autoRefundHours = 72;
      fraudVelocityLimit = 20;
      fraudDuplicateLinkThreshold = 10;
      subscriptionsEnabled = true;
      referralsEnabled = false;
    };
  };

  // --- Dashboard stats helpers ---

  public func getDashboardStats(
    orders : List.List<OrderTypes.Order>,
    users : Map.Map<Common.UserId, UserTypes.User>,
    services : List.List<ServiceTypes.Service>,
    config : AdminTypes.AdminConfig,
  ) : AdminTypes.DashboardStats {
    var totalRevenue : Float = 0.0;
    var totalOrders : Nat = 0;
    var totalActiveOrders : Nat = 0;
    let now = Time.now();
    let oneMonthNs : Int = 30 * 24 * 3_600_000_000_000;
    let oneDayNs : Int = 24 * 3_600_000_000_000;

    // Build daily buckets (last 30 days)
    let dailyRevArr = List.tabulate(30, func(_) { 0.0 });
    let dailyOrdArr : List.List<Nat> = List.tabulate(30, func(_) { 0 });

    // Service revenue map: serviceId -> (revenue, units)
    let svcRevMap = Map.empty<Nat, { var rev : Float; var units : Nat }>();

    orders.forEach(func(o) {
      totalOrders += 1;
      let price = o.totalPrice.toFloat();
      totalRevenue += price;
      switch (o.status) {
        case (#pending) { totalActiveOrders += 1 };
        case (#processing) { totalActiveOrders += 1 };
        case _ {};
      };
      // Daily bucket
      let ageDays = (now - o.createdAt) / oneDayNs;
      if (ageDays >= 0 and ageDays < 30) {
        let idx = ageDays.toNat();
        let bucket = 29 - idx; // newest = index 29
        dailyRevArr.put(bucket, dailyRevArr.at(bucket) + price);
        dailyOrdArr.put(bucket, dailyOrdArr.at(bucket) + 1);
      };
      // Service revenue
      switch (svcRevMap.get(o.serviceId)) {
        case (?entry) {
          entry.rev += price;
          entry.units += o.quantity;
        };
        case null {
          svcRevMap.add(o.serviceId, { var rev = price; var units = o.quantity });
        };
      };
    });

    let avgOrderValue = if (totalOrders == 0) { 0.0 } else { totalRevenue / totalOrders.toFloat() };
    let profitMargin = config.globalMarginPercent;

    // Count new users this month
    var newUsersThisMonth : Nat = 0;
    users.forEach(func(_, u) {
      if (now - u.createdAt <= oneMonthNs) { newUsersThisMonth += 1 };
    });

    let totalUsers = users.size();

    // Top 5 services by revenue
    let svcStatList = List.empty<AdminTypes.TopServiceStat>();
    svcRevMap.forEach(func(svcId, entry) {
      let name = switch (services.find(func(s) { s.id == svcId })) {
        case (?s) { s.name };
        case null { "Service #" # svcId.toText() };
      };
      svcStatList.add({ serviceId = svcId; name = name; revenue = entry.rev; unitsSold = entry.units });
    });
    let sortedSvcs = svcStatList.sort(func(a, b) {
      if (a.revenue > b.revenue) { #less }
      else if (a.revenue < b.revenue) { #greater }
      else { #equal };
    });
    let topArr = sortedSvcs.toArray();
    let topServices = topArr.sliceToArray(0, if (topArr.size() < 5) { topArr.size() } else { 5 });

    {
      totalRevenue = totalRevenue;
      totalOrders = totalOrders;
      totalUsers = totalUsers;
      totalActiveOrders = totalActiveOrders;
      avgOrderValue = avgOrderValue;
      profitMarginPercent = profitMargin;
      newUsersThisMonth = newUsersThisMonth;
      subscriptionRevenue = { free = 0; pro = 0; premium = 0 };
      dailyRevenue = dailyRevArr.toArray();
      dailyOrders = dailyOrdArr.toArray();
      topServices = topServices;
    };
  };

  // --- Service stats helpers ---

  public func getServiceStats(
    orders : List.List<OrderTypes.Order>,
    services : List.List<ServiceTypes.Service>,
    config : AdminTypes.AdminConfig,
  ) : [AdminTypes.ServiceStat] {
    let svcRevMap = Map.empty<Nat, { var rev : Float; var units : Nat }>();
    orders.forEach(func(o) {
      let price = o.totalPrice.toFloat();
      switch (svcRevMap.get(o.serviceId)) {
        case (?entry) { entry.rev += price; entry.units += o.quantity };
        case null { svcRevMap.add(o.serviceId, { var rev = price; var units = o.quantity }) };
      };
    });
    let result = List.empty<AdminTypes.ServiceStat>();
    services.forEach(func(s) {
      let (rev, units) = switch (svcRevMap.get(s.id)) {
        case (?e) { (e.rev, e.units) };
        case null { (0.0, 0) };
      };
      result.add({
        serviceId = s.id;
        name = s.name;
        totalRevenue = rev;
        unitsSold = units;
        profitMarginPercent = config.globalMarginPercent;
      });
    });
    result.toArray();
  };

  // --- Order helpers (admin view) ---

  public func getAllOrders(
    orders : List.List<OrderTypes.Order>,
    _statusFilter : ?Text,
    limit : Nat,
    offset : Nat,
  ) : [OrderTypes.OrderPublic] {
    let filtered = switch (_statusFilter) {
      case (?f) {
        orders.filter(func(o) {
          switch (o.status) {
            case (#pending) { f == "pending" };
            case (#processing) { f == "processing" };
            case (#completed) { f == "completed" };
            case (#failed) { f == "failed" };
            case (#refunded) { f == "refunded" };
          };
        });
      };
      case null { orders };
    };
    let arr = filtered.map<OrderTypes.Order, OrderTypes.OrderPublic>(func(o) { orderToPublic(o) }).toArray().reverse();
    let start = if (offset >= arr.size()) { return [] } else { offset };
    let end_ = if (start + limit > arr.size()) { arr.size() } else { start + limit };
    arr.sliceToArray(start, end_);
  };

  public func orderToPublic(o : OrderTypes.Order) : OrderTypes.OrderPublic {
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

  // --- User helpers (admin view) ---

  public func getAllUsers(
    users : Map.Map<Common.UserId, UserTypes.User>,
    statusFilter : ?Text,
    tierFilter : ?Text,
    limit : Nat,
    offset : Nat,
  ) : [UserTypes.UserPublic] {
    let result = List.empty<UserTypes.UserPublic>();
    users.forEach(func(_, u) {
      let roleOk = switch (tierFilter) {
        case (?t) {
          if (t == "admin") { u.role == #admin }
          else { u.role == #user };
        };
        case null { true };
      };
      if (roleOk) { result.add(userToPublic(u)) };
    });
    let arr = result.toArray();
    let start = if (offset >= arr.size()) { return [] } else { offset };
    let end_ = if (start + limit > arr.size()) { arr.size() } else { start + limit };
    arr.sliceToArray(start, end_);
  };

  public func userToPublic(u : UserTypes.User) : UserTypes.UserPublic {
    {
      id = u.id;
      username = u.username;
      email = u.email;
      avatar = u.avatar;
      createdAt = u.createdAt;
      role = u.role;
    };
  };
};
