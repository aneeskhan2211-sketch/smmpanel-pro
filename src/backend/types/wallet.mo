import Common "common";

module {
  public type TransactionType = { #credit; #debit; #refund };
  public type TransactionStatus = { #pending; #completed; #failed };

  public type Transaction = {
    id : Common.TransactionId;
    userId : Common.UserId;
    txType : TransactionType;
    amount : Nat;
    description : Text;
    createdAt : Common.Timestamp;
    status : TransactionStatus;
  };

  public type Wallet = {
    userId : Common.UserId;
    var balance : Nat;
  };
};
