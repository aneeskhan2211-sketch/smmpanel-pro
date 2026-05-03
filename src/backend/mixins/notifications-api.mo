import Common "../types/common";
import Types "../types/notifications";
import NotifLib "../lib/notifications";
import List "mo:core/List";

mixin (
  notifications : List.List<Types.Notification>,
) {
  var nextNotifId : Nat = 1;

  // Get own notifications (newest first)
  public shared query ({ caller }) func getMyNotifications() : async [Types.NotificationPublic] {
    NotifLib.getUserNotifications(notifications, caller);
  };

  // Mark a notification as read
  public shared ({ caller }) func markNotificationRead(notifId : Common.NotificationId) : async () {
    NotifLib.markAsRead(notifications, caller, notifId);
  };

  // Get unread count
  public shared query ({ caller }) func getUnreadNotificationCount() : async Nat {
    NotifLib.getUnreadCount(notifications, caller);
  };
};
