import Common "common";

module {
  public type TicketStatus = { #open; #in_progress; #resolved; #closed };
  public type TicketCategory = { #billing; #technical; #order; #general };

  public type Ticket = {
    id : Common.TicketId;
    userId : Common.UserId;
    var subject : Text;
    category : TicketCategory;
    var status : TicketStatus;
    createdAt : Common.Timestamp;
    var lastUpdatedAt : Common.Timestamp;
  };

  // Shared-safe version for public API boundaries (no var fields)
  public type TicketPublic = {
    id : Common.TicketId;
    userId : Common.UserId;
    subject : Text;
    category : TicketCategory;
    status : TicketStatus;
    createdAt : Common.Timestamp;
    lastUpdatedAt : Common.Timestamp;
  };

  public type TicketMessage = {
    id : Common.TicketMessageId;
    ticketId : Common.TicketId;
    authorId : Common.UserId;
    message : Text;
    isAdminReply : Bool;
    createdAt : Common.Timestamp;
  };

  public type TicketWithMessages = {
    ticket : {
      id : Common.TicketId;
      userId : Common.UserId;
      subject : Text;
      category : TicketCategory;
      status : TicketStatus;
      createdAt : Common.Timestamp;
      lastUpdatedAt : Common.Timestamp;
    };
    messages : [TicketMessage];
  };
};
