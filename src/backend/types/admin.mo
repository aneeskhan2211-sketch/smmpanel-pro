import Common "common";

module {
  public type AdminConfig = {
    globalMarginPercent : Float;
    maxOrdersPerUserPerDay : Nat;
    maxConcurrentOrdersPerLink : Nat;
    minUserAgeDays : Nat;
    autoRefundHours : Nat;
    fraudVelocityLimit : Nat;
    fraudDuplicateLinkThreshold : Nat;
    subscriptionsEnabled : Bool;
    referralsEnabled : Bool;
  };

  public type ProviderStatus = { #active; #inactive; #testing };

  public type Provider = {
    id : Nat;
    var name : Text;
    var apiUrl : Text;
    var apiKeyMasked : Text;
    var commissionPercent : Float;
    var priority : Nat;
    var status : ProviderStatus;
    var successRate : Float;
    var failedLast24h : Nat;
    var avgResponseMs : Nat;
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type ProviderPublic = {
    id : Nat;
    name : Text;
    apiUrl : Text;
    apiKeyMasked : Text;
    commissionPercent : Float;
    priority : Nat;
    status : ProviderStatus;
    successRate : Float;
    failedLast24h : Nat;
    avgResponseMs : Nat;
  };

  public type LogStatus = { #success; #error };

  public type SystemLog = {
    id : Nat;
    timestamp : Int;
    action : Text;
    actorId : Text;
    targetType : Text;
    targetId : Text;
    details : Text;
    status : LogStatus;
  };

  public type AlertType = { #highVelocity; #duplicateLink; #bulkOrders; #lowServiceRatio };
  public type AlertAction = { #flagged; #blocked; #whitelisted };

  public type FraudAlert = {
    id : Nat;
    timestamp : Int;
    userId : Text;
    alertType : AlertType;
    riskScore : Nat;
    orderId : ?Text;
    var actionTaken : AlertAction;
    var resolved : Bool;
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type FraudAlertPublic = {
    id : Nat;
    timestamp : Int;
    userId : Text;
    alertType : AlertType;
    riskScore : Nat;
    orderId : ?Text;
    actionTaken : AlertAction;
    resolved : Bool;
  };

  public type DashboardStats = {
    totalRevenue : Float;
    totalOrders : Nat;
    totalUsers : Nat;
    totalActiveOrders : Nat;
    avgOrderValue : Float;
    profitMarginPercent : Float;
    newUsersThisMonth : Nat;
    subscriptionRevenue : { free : Nat; pro : Nat; premium : Nat };
    dailyRevenue : [Float];
    dailyOrders : [Nat];
    topServices : [TopServiceStat];
  };

  public type TopServiceStat = {
    serviceId : Nat;
    name : Text;
    revenue : Float;
    unitsSold : Nat;
  };

  public type ServiceStat = {
    serviceId : Nat;
    name : Text;
    totalRevenue : Float;
    unitsSold : Nat;
    profitMarginPercent : Float;
  };
};
