import Common "../types/common";
import Types "../types/tickets";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func toPublic(t : Types.Ticket) : Types.TicketPublic {
    {
      id = t.id;
      userId = t.userId;
      subject = t.subject;
      category = t.category;
      status = t.status;
      createdAt = t.createdAt;
      lastUpdatedAt = t.lastUpdatedAt;
    };
  };

  public func createTicket(
    tickets : List.List<Types.Ticket>,
    nextId : Nat,
    userId : Common.UserId,
    subject : Text,
    category : Types.TicketCategory,
  ) : Types.Ticket {
    let now = Time.now();
    let ticket : Types.Ticket = {
      id = nextId;
      userId = userId;
      var subject = subject;
      category = category;
      var status = #open;
      createdAt = now;
      var lastUpdatedAt = now;
    };
    tickets.add(ticket);
    ticket;
  };

  public func getUserTickets(
    tickets : List.List<Types.Ticket>,
    userId : Common.UserId,
  ) : [Types.TicketPublic] {
    tickets.filter(func(t) { Principal.equal(t.userId, userId) })
      .map<Types.Ticket, Types.TicketPublic>(func(t) { toPublic(t) })
      .toArray()
      .reverse();
  };

  public func getTicketWithMessages(
    tickets : List.List<Types.Ticket>,
    messages : List.List<Types.TicketMessage>,
    ticketId : Common.TicketId,
    requesterId : Common.UserId,
  ) : ?Types.TicketWithMessages {
    switch (tickets.find(func(t) { t.id == ticketId })) {
      case null { null };
      case (?t) {
        // requester must be owner — admin check is done at mixin level
        let msgs = messages.filter(func(m) { m.ticketId == ticketId }).toArray();
        ?{
          ticket = {
            id = t.id;
            userId = t.userId;
            subject = t.subject;
            category = t.category;
            status = t.status;
            createdAt = t.createdAt;
            lastUpdatedAt = t.lastUpdatedAt;
          };
          messages = msgs;
        };
      };
    };
  };

  public func replyToTicket(
    tickets : List.List<Types.Ticket>,
    messages : List.List<Types.TicketMessage>,
    nextMessageId : Nat,
    caller : Common.UserId,
    ticketId : Common.TicketId,
    message : Text,
    isAdminReply : Bool,
  ) : Types.TicketMessage {
    let ticket = switch (tickets.find(func(t) { t.id == ticketId })) {
      case (?t) { t };
      case null { Runtime.trap("Ticket not found") };
    };
    let now = Time.now();
    ticket.lastUpdatedAt := now;
    ticket.status := #in_progress;
    let msg : Types.TicketMessage = {
      id = nextMessageId;
      ticketId = ticketId;
      authorId = caller;
      message = message;
      isAdminReply = isAdminReply;
      createdAt = now;
    };
    messages.add(msg);
    msg;
  };

  public func closeTicket(
    tickets : List.List<Types.Ticket>,
    caller : Common.UserId,
    ticketId : Common.TicketId,
  ) : () {
    let ticket = switch (tickets.find(func(t) { t.id == ticketId })) {
      case (?t) { t };
      case null { Runtime.trap("Ticket not found") };
    };
    if (not Principal.equal(ticket.userId, caller)) { Runtime.trap("Not your ticket") };
    ticket.status := #closed;
    ticket.lastUpdatedAt := Time.now();
  };

  public func listAllTickets(
    tickets : List.List<Types.Ticket>,
  ) : [Types.TicketPublic] {
    tickets.map<Types.Ticket, Types.TicketPublic>(func(t) { toPublic(t) }).toArray().reverse();
  };
};
