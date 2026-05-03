import Common "../types/common";
import Types "../types/wallet";
import UserTypes "../types/users";
import WalletLib "../lib/wallet";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  wallets : Map.Map<Common.UserId, Types.Wallet>,
  transactions : List.List<Types.Transaction>,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  // Get own wallet balance
  public shared query ({ caller }) func getMyBalance() : async Nat {
    WalletLib.getBalance(wallets, caller);
  };

  // Get own transaction history (newest first)
  public shared query ({ caller }) func getMyTransactions() : async [Types.Transaction] {
    WalletLib.getTransactions(transactions, caller).reverse();
  };

  // Admin: add funds to a user wallet
  public shared ({ caller }) func adminAddFunds(userId : Common.UserId, amount : Nat, description : Text) : async Types.Transaction {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let tx = WalletLib.addFunds(wallets, transactions, userId, amount, description);
    tx;
  };
};
