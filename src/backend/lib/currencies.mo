import CurrencyTypes "../types/currencies";
import List "mo:core/List";

module {
  public func toPublic(c : CurrencyTypes.Currency) : CurrencyTypes.CurrencyPublic {
    {
      code = c.code;
      symbol = c.symbol;
      flag = c.flag;
      displayName = c.displayName;
      exchangeRate = c.exchangeRate;
      isActive = c.isActive;
    };
  };

  public func listCurrencies(currencies : List.List<CurrencyTypes.Currency>) : [CurrencyTypes.CurrencyPublic] {
    currencies.filter(func(c) { c.isActive })
      .map<CurrencyTypes.Currency, CurrencyTypes.CurrencyPublic>(func(c) { toPublic(c) })
      .toArray();
  };

  public func getCurrency(
    currencies : List.List<CurrencyTypes.Currency>,
    code : Text,
  ) : ?CurrencyTypes.Currency {
    currencies.find(func(c) { c.code == code });
  };

  public func addCurrency(
    currencies : List.List<CurrencyTypes.Currency>,
    code : Text,
    symbol : Text,
    flag : Text,
    displayName : Text,
    exchangeRate : Float,
  ) : CurrencyTypes.Currency {
    let cur : CurrencyTypes.Currency = {
      code = code;
      var symbol = symbol;
      var flag = flag;
      var displayName = displayName;
      var exchangeRate = exchangeRate;
      var isActive = true;
    };
    currencies.add(cur);
    cur;
  };

  public func updateExchangeRate(
    currencies : List.List<CurrencyTypes.Currency>,
    code : Text,
    newRate : Float,
  ) : Bool {
    var found = false;
    currencies.mapInPlace(func(c) {
      if (c.code == code) {
        found := true;
        c.exchangeRate := newRate;
        c;
      } else { c };
    });
    found;
  };

  // Convert a price in INR paise to target currency amount
  public func convertFromINR(amountINR : Nat, rate : Float) : Float {
    amountINR.toFloat() * rate;
  };
};
