import Common "../types/common";
import Types "../types/tickets";
import UserTypes "../types/users";
import NotifTypes "../types/notifications";
import TicketLib "../lib/tickets";
import NotifLib "../lib/notifications";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  tickets : List.List<Types.Ticket>,
  ticketMessages : List.List<Types.TicketMessage>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  notifications : List.List<NotifTypes.Notification>,
) {
  var nextTicketId : Nat = 1;
  var nextMessageId : Nat = 1;
  var ticketsNextNotifId : Nat = 1;

  // Create a support ticket
  public shared ({ caller }) func createTicket(subject : Text, category : Types.TicketCategory) : async Types.TicketPublic {
    let ticket = TicketLib.createTicket(tickets, nextTicketId, caller, subject, category);
    nextTicketId += 1;
    TicketLib.toPublic(ticket);
  };

  // Get own tickets
  public shared query ({ caller }) func getMyTickets() : async [Types.TicketPublic] {
    TicketLib.getUserTickets(tickets, caller);
  };

  // Get ticket detail with messages (owner or admin)
  public shared query ({ caller }) func getTicketDetail(ticketId : Common.TicketId) : async ?Types.TicketWithMessages {
    let isAdmin = switch (users.get(caller)) {
      case (?u) { u.role == #admin };
      case null { false };
    };
    switch (TicketLib.getTicketWithMessages(tickets, ticketMessages, ticketId, caller)) {
      case null { null };
      case (?detail) {
        if (Principal.equal(detail.ticket.userId, caller) or isAdmin) {
          ?detail;
        } else { null };
      };
    };
  };

  // Reply to a ticket (non-admin)
  public shared ({ caller }) func replyToTicket(ticketId : Common.TicketId, message : Text) : async Types.TicketMessage {
    let ticket = switch (tickets.find(func(t) { t.id == ticketId })) {
      case (?t) { t };
      case null { Runtime.trap("Ticket not found") };
    };
    if (not Principal.equal(ticket.userId, caller)) { Runtime.trap("Not your ticket") };
    let msg = TicketLib.replyToTicket(tickets, ticketMessages, nextMessageId, caller, ticketId, message, false);
    nextMessageId += 1;
    msg;
  };

  // Close own ticket
  public shared ({ caller }) func closeMyTicket(ticketId : Common.TicketId) : async () {
    TicketLib.closeTicket(tickets, caller, ticketId);
  };

  // Admin: list all tickets
  public shared query ({ caller }) func adminListTickets() : async [Types.TicketPublic] {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    TicketLib.listAllTickets(tickets);
  };

  // Admin: reply with admin flag and notify ticket owner
  public shared ({ caller }) func adminReplyToTicket(ticketId : Common.TicketId, message : Text) : async Types.TicketMessage {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let ticket = switch (tickets.find(func(t) { t.id == ticketId })) {
      case (?t) { t };
      case null { Runtime.trap("Ticket not found") };
    };
    let msg = TicketLib.replyToTicket(tickets, ticketMessages, nextMessageId, caller, ticketId, message, true);
    nextMessageId += 1;
    NotifLib.createNotification(
      notifications, ticketsNextNotifId, ticket.userId, #support_reply,
      "Support replied to your ticket: " # ticket.subject,
    );
    ticketsNextNotifId += 1;
    msg;
  };
};
