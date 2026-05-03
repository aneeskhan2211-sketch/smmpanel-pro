import Common "common";

module {
  public type ApiKey = {
    id : Common.ApiKeyId;
    userId : Common.UserId;
    var name : Text;
    keyHash : Text;
    maskedKey : Text;
    createdAt : Common.Timestamp;
    var lastUsed : ?Common.Timestamp;
    var isActive : Bool;
    var usageCount : Nat;
  };

  public type ApiKeyPublic = {
    id : Common.ApiKeyId;
    userId : Common.UserId;
    name : Text;
    maskedKey : Text;
    createdAt : Common.Timestamp;
    lastUsed : ?Common.Timestamp;
    isActive : Bool;
    usageCount : Nat;
  };
};
