import Common "../types/common";
import Types "../types/wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public func getBalance(
    wallets : Map.Map<Common.UserId, Types.Wallet>,
    userId : Common.UserId,
  ) : Nat {
    switch (wallets.get(userId)) {
      case (?w) { w.balance };
      case null { 0 };
    };
  };

  public func getOrCreateWallet(
    wallets : Map.Map<Common.UserId, Types.Wallet>,
    userId : Common.UserId,
  ) : Types.Wallet {
    switch (wallets.get(userId)) {
      case (?w) { w };
      case null {
        let w : Types.Wallet = { userId = userId; var balance = 0 };
        wallets.add(userId, w);
        w;
      };
    };
  };

  public func getTransactions(
    transactions : List.List<Types.Transaction>,
    userId : Common.UserId,
  ) : [Types.Transaction] {
    transactions.filter(func(t) { Principal.equal(t.userId, userId) })
      .toArray();
  };

  public func addFunds(
    wallets : Map.Map<Common.UserId, Types.Wallet>,
    transactions : List.List<Types.Transaction>,
    userId : Common.UserId,
    amount : Nat,
    description : Text,
  ) : Types.Transaction {
    let wallet = getOrCreateWallet(wallets, userId);
    wallet.balance += amount;
    let tx : Types.Transaction = {
      id = transactions.size() + 1;
      userId = userId;
      txType = #credit;
      amount = amount;
      description = description;
      createdAt = Time.now();
      status = #completed;
    };
    transactions.add(tx);
    tx;
  };

  public func deductFunds(
    wallets : Map.Map<Common.UserId, Types.Wallet>,
    transactions : List.List<Types.Transaction>,
    userId : Common.UserId,
    amount : Nat,
    description : Text,
  ) : Types.Transaction {
    let wallet = getOrCreateWallet(wallets, userId);
    if (wallet.balance < amount) { Runtime.trap("Insufficient balance") };
    wallet.balance -= amount;
    let tx : Types.Transaction = {
      id = transactions.size() + 1;
      userId = userId;
      txType = #debit;
      amount = amount;
      description = description;
      createdAt = Time.now();
      status = #completed;
    };
    transactions.add(tx);
    tx;
  };

  public func refundFunds(
    wallets : Map.Map<Common.UserId, Types.Wallet>,
    transactions : List.List<Types.Transaction>,
    userId : Common.UserId,
    amount : Nat,
    description : Text,
  ) : Types.Transaction {
    let wallet = getOrCreateWallet(wallets, userId);
    wallet.balance += amount;
    let tx : Types.Transaction = {
      id = transactions.size() + 1;
      userId = userId;
      txType = #refund;
      amount = amount;
      description = description;
      createdAt = Time.now();
      status = #completed;
    };
    transactions.add(tx);
    tx;
  };
};
