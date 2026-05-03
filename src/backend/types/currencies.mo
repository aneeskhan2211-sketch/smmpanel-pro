module {
  public type Currency = {
    code : Text; // "INR", "USD" etc.
    var symbol : Text;
    var flag : Text; // emoji flag
    var displayName : Text;
    var exchangeRate : Float; // relative to INR base
    var isActive : Bool;
  };

  public type CurrencyPublic = {
    code : Text;
    symbol : Text;
    flag : Text;
    displayName : Text;
    exchangeRate : Float;
    isActive : Bool;
  };
};
