import Common "../types/common";
import Types "../types/notifications";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func toPublic(n : Types.Notification) : Types.NotificationPublic {
    {
      id = n.id;
      userId = n.userId;
      notifType = n.notifType;
      message = n.message;
      isRead = n.isRead;
      createdAt = n.createdAt;
    };
  };

  public func getUserNotifications(
    notifications : List.List<Types.Notification>,
    userId : Common.UserId,
  ) : [Types.NotificationPublic] {
    notifications.filter(func(n) { Principal.equal(n.userId, userId) })
      .map<Types.Notification, Types.NotificationPublic>(func(n) { toPublic(n) })
      .toArray()
      .reverse();
  };

  public func markAsRead(
    notifications : List.List<Types.Notification>,
    caller : Common.UserId,
    notifId : Common.NotificationId,
  ) : () {
    notifications.mapInPlace(func(n) {
      if (n.id == notifId and Principal.equal(n.userId, caller)) {
        n.isRead := true;
        n;
      } else { n };
    });
  };

  public func getUnreadCount(
    notifications : List.List<Types.Notification>,
    userId : Common.UserId,
  ) : Nat {
    var count = 0;
    notifications.forEach(func(n) {
      if (Principal.equal(n.userId, userId) and not n.isRead) {
        count += 1;
      };
    });
    count;
  };

  public func createNotification(
    notifications : List.List<Types.Notification>,
    _nextId : Nat,
    userId : Common.UserId,
    notifType : Types.NotificationType,
    message : Text,
  ) : () {
    let n : Types.Notification = {
      id = notifications.size() + 1;
      userId = userId;
      notifType = notifType;
      message = message;
      var isRead = false;
      createdAt = Time.now();
    };
    notifications.add(n);
  };
};
