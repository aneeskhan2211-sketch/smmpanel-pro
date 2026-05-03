import Common "common";

module {
  public type NotificationType = {
    #order_update;
    #wallet_alert;
    #support_reply;
    #promo;
  };

  public type Notification = {
    id : Common.NotificationId;
    userId : Common.UserId;
    notifType : NotificationType;
    message : Text;
    var isRead : Bool;
    createdAt : Common.Timestamp;
  };

  public type NotificationPublic = {
    id : Common.NotificationId;
    userId : Common.UserId;
    notifType : NotificationType;
    message : Text;
    isRead : Bool;
    createdAt : Common.Timestamp;
  };
};
