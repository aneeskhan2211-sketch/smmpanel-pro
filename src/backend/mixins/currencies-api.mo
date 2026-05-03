import Common "../types/common";
import CurrencyTypes "../types/currencies";
import UserTypes "../types/users";
import CurrencyLib "../lib/currencies";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  currencies : List.List<CurrencyTypes.Currency>,
  users : Map.Map<Common.UserId, UserTypes.User>,
) {
  // List all active currencies
  public query func listCurrencies() : async [CurrencyTypes.CurrencyPublic] {
    CurrencyLib.listCurrencies(currencies);
  };

  // Convert a price in INR paise to a specific currency
  public query func convertPrice(amountINR : Nat, currencyCode : Text) : async ?Float {
    switch (CurrencyLib.getCurrency(currencies, currencyCode)) {
      case (?c) { ?CurrencyLib.convertFromINR(amountINR, c.exchangeRate) };
      case null { null };
    };
  };

  // Admin: update exchange rate
  public shared ({ caller }) func adminUpdateExchangeRate(currencyCode : Text, newRate : Float) : async Bool {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    CurrencyLib.updateExchangeRate(currencies, currencyCode, newRate);
  };

  // Admin: add new currency
  public shared ({ caller }) func adminAddCurrency(
    code : Text,
    symbol : Text,
    flag : Text,
    displayName : Text,
    exchangeRate : Float,
  ) : async CurrencyTypes.CurrencyPublic {
    let callerUser = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("Unauthorized") };
    };
    if (callerUser.role != #admin) { Runtime.trap("Admin only") };
    let c = CurrencyLib.addCurrency(currencies, code, symbol, flag, displayName, exchangeRate);
    CurrencyLib.toPublic(c);
  };
};
