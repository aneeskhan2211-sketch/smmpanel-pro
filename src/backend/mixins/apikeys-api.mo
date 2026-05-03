import Common "../types/common";
import Types "../types/apikeys";
import ApiKeyLib "../lib/apikeys";
import List "mo:core/List";

mixin (
  apiKeys : List.List<Types.ApiKey>,
) {
  var nextApiKeyId : Nat = 1;

  // Generate a new API key
  public shared ({ caller }) func generateApiKey(name : Text) : async Types.ApiKeyPublic {
    let (key, _rawKey) = ApiKeyLib.generateKey(apiKeys, nextApiKeyId, caller, name);
    nextApiKeyId += 1;
    ApiKeyLib.toPublic(key);
  };

  // List own API keys
  public shared query ({ caller }) func listMyApiKeys() : async [Types.ApiKeyPublic] {
    ApiKeyLib.listUserKeys(apiKeys, caller);
  };

  // Revoke an API key
  public shared ({ caller }) func revokeApiKey(keyId : Common.ApiKeyId) : async () {
    ApiKeyLib.revokeKey(apiKeys, caller, keyId);
  };
};
