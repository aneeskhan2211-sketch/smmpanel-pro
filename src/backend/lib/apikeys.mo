import Common "../types/common";
import Types "../types/apikeys";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";

module {
  public func toPublic(key : Types.ApiKey) : Types.ApiKeyPublic {
    {
      id = key.id;
      userId = key.userId;
      name = key.name;
      maskedKey = key.maskedKey;
      createdAt = key.createdAt;
      lastUsed = key.lastUsed;
      isActive = key.isActive;
      usageCount = key.usageCount;
    };
  };

  // Deterministic pseudo-random key: 32 alphanumeric chars from seed
  func generateRawKey(userId : Principal, id : Nat, now : Int) : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charsArr = chars.toArray();
    let seed = userId.toText() # now.toText() # id.toText();
    var h : Nat = 5381;
    for (c in seed.toIter()) {
      h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
    };
    var key = "";
    var i = 0;
    while (i < 32) {
      let idx = (h + i * 31 + i * i * 7) % 62;
      key := key # Text.fromChar(charsArr[idx]);
      i += 1;
    };
    key;
  };

  public func generateKey(
    keys : List.List<Types.ApiKey>,
    nextId : Nat,
    userId : Common.UserId,
    name : Text,
  ) : (Types.ApiKey, Text) {
    let now = Time.now();
    let rawKey = generateRawKey(userId, nextId, now);
    // hash: djb2 variant stored as text
    var h : Nat = 5381;
    for (c in rawKey.toIter()) {
      h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
    };
    let keyHash = "h" # h.toText();
    // mask: show last 4 chars
    let arr = rawKey.toArray();
    let tail = Text.fromArray(arr.sliceToArray(28, 32));
    let masked = "sk_..." # tail;
    let key : Types.ApiKey = {
      id = nextId;
      userId = userId;
      var name = name;
      keyHash = keyHash;
      maskedKey = masked;
      createdAt = now;
      var lastUsed = null;
      var isActive = true;
      var usageCount = 0;
    };
    keys.add(key);
    (key, rawKey);
  };

  public func listUserKeys(
    keys : List.List<Types.ApiKey>,
    userId : Common.UserId,
  ) : [Types.ApiKeyPublic] {
    keys.filter(func(k) { Principal.equal(k.userId, userId) })
      .map<Types.ApiKey, Types.ApiKeyPublic>(func(k) { toPublic(k) }).toArray();
  };

  public func revokeKey(
    keys : List.List<Types.ApiKey>,
    caller : Common.UserId,
    keyId : Common.ApiKeyId,
  ) : () {
    keys.mapInPlace(func(k) {
      if (k.id == keyId and Principal.equal(k.userId, caller)) {
        k.isActive := false;
        k;
      } else { k };
    });
  };
};
