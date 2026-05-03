import Common "types/common";
import UserTypes "types/users";
import ServiceTypes "types/services";
import OrderTypes "types/orders";
import WalletTypes "types/wallet";
import SubTypes "types/subscriptions";
import ApiKeyTypes "types/apikeys";
import TicketTypes "types/tickets";
import NotifTypes "types/notifications";
import TierTypes "types/tiers";
import BundleTypes "types/bundles";
import CurrencyTypes "types/currencies";
import EngagementTypes "types/engagement";

import UsersApi "mixins/users-api";
import ServicesApi "mixins/services-api";
import OrdersApi "mixins/orders-api";
import WalletApi "mixins/wallet-api";
import SubsApi "mixins/subscriptions-api";
import ApiKeysApi "mixins/apikeys-api";
import TicketsApi "mixins/tickets-api";
import NotifsApi "mixins/notifications-api";
import TiersApi "mixins/tiers-api";
import BundlesApi "mixins/bundles-api";
import CurrenciesApi "mixins/currencies-api";
import EngagementApi "mixins/engagement-api";

import ServiceLib "lib/services";
import TierLib "lib/tiers";
import BundleLib "lib/bundles";
import CurrencyLib "lib/currencies";
import EngagementLib "lib/engagement";

import Map "mo:core/Map";
import List "mo:core/List";
import AdminTypes "types/admin";
import AdminLib "lib/admin";
import AdminApi "mixins/admin-api";



actor {
  // --- Users ---
  let users = Map.empty<Common.UserId, UserTypes.User>();

  // --- Services ---
  let services = List.empty<ServiceTypes.Service>();

  // --- Orders ---
  let orders = List.empty<OrderTypes.Order>();

  // --- Wallet ---
  let wallets = Map.empty<Common.UserId, WalletTypes.Wallet>();
  let transactions = List.empty<WalletTypes.Transaction>();

  // --- Subscriptions ---
  let plans = List.empty<SubTypes.SubscriptionPlan>();
  let subscriptions = Map.empty<Common.UserId, SubTypes.UserSubscription>();

  // --- API Keys ---
  let apiKeys = List.empty<ApiKeyTypes.ApiKey>();

  // --- Tickets ---
  let tickets = List.empty<TicketTypes.Ticket>();
  let ticketMessages = List.empty<TicketTypes.TicketMessage>();

  // --- Notifications ---
  let notifications = List.empty<NotifTypes.Notification>();

  // --- Seed subscription plans ---
  plans.add({
    id = 0;
    tier = #free;
    name = "Free";
    priceMonthly = 0;
    discountPercent = 0;
    features = ["Basic services", "Standard delivery"];
  });
  plans.add({
    id = 1;
    tier = #pro;
    name = "Pro";
    priceMonthly = 9900;
    discountPercent = 15;
    features = ["All services", "15% discount", "Priority support"];
  });
  plans.add({
    id = 2;
    tier = #premium;
    name = "Premium";
    priceMonthly = 19900;
    discountPercent = 25;
    features = ["All services", "25% discount", "Priority delivery", "Dedicated support"];
  });

  // --- Seed 15 sample services (across 7 platforms) using addService helper ---
  // Instagram (3)
  ignore ServiceLib.addService(services, 1,  "Instagram Followers",          #instagram, 50,  100,  100000,   24, true,  5, 97);
  ignore ServiceLib.addService(services, 2,  "Instagram Likes",              #instagram, 10,  50,   50000,    1,  false, 4, 99);
  ignore ServiceLib.addService(services, 3,  "Instagram Reels Views",        #instagram, 5,   500,  500000,   2,  false, 4, 98);
  // YouTube (3)
  ignore ServiceLib.addService(services, 4,  "YouTube Subscribers",          #youtube,   300, 100,  50000,    48, true,  5, 95);
  ignore ServiceLib.addService(services, 5,  "YouTube Views",                #youtube,   8,   1000, 1000000,  6,  false, 4, 99);
  ignore ServiceLib.addService(services, 6,  "YouTube Watch Time Hours",     #youtube,   500, 100,  10000,    72, false, 5, 93);
  // TikTok (2)
  ignore ServiceLib.addService(services, 7,  "TikTok Followers",             #tiktok,    40,  100,  100000,   12, true,  4, 96);
  ignore ServiceLib.addService(services, 8,  "TikTok Video Views",           #tiktok,    6,   1000, 5000000,  1,  false, 4, 99);
  // Facebook (2)
  ignore ServiceLib.addService(services, 9,  "Facebook Page Likes",          #facebook,  60,  100,  50000,    24, false, 3, 94);
  ignore ServiceLib.addService(services, 10, "Facebook Post Likes",          #facebook,  15,  50,   20000,    2,  false, 4, 97);
  // Twitter / X (2)
  ignore ServiceLib.addService(services, 11, "Twitter Followers",            #twitter,   80,  100,  50000,    24, true,  4, 95);
  ignore ServiceLib.addService(services, 12, "Twitter Retweets",             #twitter,   20,  50,   10000,    3,  false, 3, 96);
  // Telegram (1)
  ignore ServiceLib.addService(services, 13, "Telegram Channel Members",     #telegram,  35,  100,  100000,   12, true,  4, 97);
  // Website (2)
  ignore ServiceLib.addService(services, 14, "Website Traffic - Real",       #website,   25,  1000, 1000000,  6,  false, 5, 98);
  ignore ServiceLib.addService(services, 15, "Website SEO Backlinks",        #website,   200, 50,   5000,     72, false, 4, 91);

  // --- Admin domain state ---
  let providers = List.empty<AdminTypes.Provider>();
  let adminLogs = List.empty<AdminTypes.SystemLog>();
  let fraudAlerts = List.empty<AdminTypes.FraudAlert>();
  let adminConfig = { var value : AdminTypes.AdminConfig = AdminLib.defaultConfig() };

  // --- Pricing tiers state ---
  let serviceTiers = List.empty<TierTypes.ServiceTier>();

  // --- Bundles state ---
  let bundles = List.empty<BundleTypes.Bundle>();

  // --- Currencies state ---
  let currencies = List.empty<CurrencyTypes.Currency>();

  // --- Engagement state ---
  let userLevels = List.empty<EngagementTypes.UserLevel>();
  let walletRewards = List.empty<EngagementTypes.WalletReward>();
  let engagementLogs = List.empty<EngagementTypes.EngagementLog>();
  let coupons = List.empty<EngagementTypes.Coupon>();
  let referrals = List.empty<EngagementTypes.Referral>();
  let reviews = List.empty<EngagementTypes.Review>();
  let pricingRules = List.empty<EngagementTypes.AdminPricingRule>();

  // --- Seed providers ---
  ignore AdminLib.addProvider(providers, 1, "SMM Raja", "https://smmraja.com/api/v2", "rj_live_key_abc123", 12.0, 1);
  ignore AdminLib.addProvider(providers, 2, "PerfectPanel", "https://perfectpanel.com/api", "pp_live_key_xyz789", 15.0, 2);

  // --- Seed sample logs ---
  AdminLib.addLog(adminLogs, 1, "system_start", "system", "canister", "main", "Canister initialized", #success);
  AdminLib.addLog(adminLogs, 2, "provider_add", "system", "provider", "1", "Added SMM Raja provider", #success);
  AdminLib.addLog(adminLogs, 3, "provider_add", "system", "provider", "2", "Added PerfectPanel provider", #success);
  AdminLib.addLog(adminLogs, 4, "config_update", "system", "config", "global", "Default config applied", #success);
  AdminLib.addLog(adminLogs, 5, "service_visibility", "system", "service", "3", "Instagram Reels Views activated", #success);
  AdminLib.addLog(adminLogs, 6, "order_manual_update", "system", "order", "1", "Demo log: Order status updated", #success);
  AdminLib.addLog(adminLogs, 7, "wallet_credit", "system", "user", "demo-user-1", "Demo credit applied", #success);

  // --- Seed sample fraud alerts ---
  fraudAlerts.add(({ id = 1; timestamp = (1_700_000_000_000_000_000 : Int); userId = "demo-user-2"; alertType = #highVelocity; riskScore = 85; orderId = ?"42"; var actionTaken = #flagged; var resolved = false } : AdminTypes.FraudAlert));
  fraudAlerts.add(({ id = 2; timestamp = (1_700_100_000_000_000_000 : Int); userId = "demo-user-3"; alertType = #duplicateLink; riskScore = 70; orderId = ?"55"; var actionTaken = #blocked; var resolved = true } : AdminTypes.FraudAlert));
  fraudAlerts.add(({ id = 3; timestamp = (1_700_200_000_000_000_000 : Int); userId = "demo-user-4"; alertType = #bulkOrders; riskScore = 60; orderId = (null : ?Text); var actionTaken = #flagged; var resolved = false } : AdminTypes.FraudAlert));
  fraudAlerts.add(({ id = 4; timestamp = (1_700_300_000_000_000_000 : Int); userId = "demo-user-5"; alertType = #lowServiceRatio; riskScore = 45; orderId = ?"78"; var actionTaken = #whitelisted; var resolved = true } : AdminTypes.FraudAlert));
  fraudAlerts.add(({ id = 5; timestamp = (1_700_400_000_000_000_000 : Int); userId = "demo-user-6"; alertType = #highVelocity; riskScore = 92; orderId = ?"99"; var actionTaken = #blocked; var resolved = false } : AdminTypes.FraudAlert));

  // --- Seed 3 service tiers ---
  ignore TierLib.addTier(
    serviceTiers, 1, #basic, "Basic", "⚡ Fast Delivery",
    "Fast delivery, limited refill. Best for quick campaigns.",
    1.0, 1.0, false, false, #standard,
    ["Fast delivery", "Standard quality", "Email support"],
  );
  ignore TierLib.addTier(
    serviceTiers, 2, #recommended, "Recommended", "🔥 Most Popular",
    "Better retention, faster support. The smart choice for growing accounts.",
    1.25, 1.2, false, false, #priority,
    ["Better retention", "Priority support", "Faster delivery", "Higher quality"],
  );
  ignore TierLib.addTier(
    serviceTiers, 3, #premium, "Premium", "💎 Best Quality",
    "High retention, natural speed, refill guarantee, priority processing.",
    1.875, 1.5, true, true, #dedicated,
    ["High Retention", "Safer Growth", "Better Quality", "Refill Included", "Priority Delivery", "Dedicated support"],
  );

  // --- Seed 5 bundles ---
  ignore BundleLib.addBundle(
    bundles, 1, "Starter Growth Pack",
    "Perfect for new accounts. Boost followers, likes, and views in one go.",
    [{ serviceId = 1; quantity = 1000 }, { serviceId = 2; quantity = 500 }, { serviceId = 3; quantity = 5000 }],
    49900, 34900, 48, true, "🔥 Most Popular", "🚀",
  );
  ignore BundleLib.addBundle(
    bundles, 2, "Reels Viral Pack",
    "Go viral on Instagram Reels. Views, likes, saves, and shares combined.",
    [{ serviceId = 3; quantity = 10000 }, { serviceId = 2; quantity = 1000 }],
    34900, 24900, 24, true, "⚡ Trending", "🎬",
  );
  ignore BundleLib.addBundle(
    bundles, 3, "YouTube Growth Pack",
    "Grow your YouTube channel fast. Views, likes, and subscribers together.",
    [{ serviceId = 5; quantity = 5000 }, { serviceId = 4; quantity = 500 }],
    59900, 42900, 72, true, "💎 Best Value", "▶️",
  );
  ignore BundleLib.addBundle(
    bundles, 4, "Business Boost Pack",
    "Drive real traffic, reviews, and social engagement to your business.",
    [{ serviceId = 14; quantity = 10000 }, { serviceId = 9; quantity = 1000 }],
    79900, 54900, 96, true, "🛡 Trusted", "💼",
  );
  ignore BundleLib.addBundle(
    bundles, 5, "Premium Brand Pack",
    "Complete brand presence. Followers, comments, profile visits, and content strategy.",
    [{ serviceId = 1; quantity = 5000 }, { serviceId = 2; quantity = 2000 }, { serviceId = 3; quantity = 20000 }],
    149900, 99900, 120, true, "👑 Premium", "✨",
  );

  // --- Seed 7 currencies ---
  ignore CurrencyLib.addCurrency(currencies, "INR", "₹",  "🇮🇳", "Indian Rupee",     1.0);
  ignore CurrencyLib.addCurrency(currencies, "USD", "$",  "🇺🇸", "US Dollar",         0.012);
  ignore CurrencyLib.addCurrency(currencies, "AED", "د.إ","🇦🇪", "UAE Dirham",        0.044);
  ignore CurrencyLib.addCurrency(currencies, "OMR", "﷼",  "🇴🇲", "Omani Rial",        0.0046);
  ignore CurrencyLib.addCurrency(currencies, "SAR", "﷼",  "🇸🇦", "Saudi Riyal",       0.045);
  ignore CurrencyLib.addCurrency(currencies, "EUR", "€",  "🇪🇺", "Euro",              0.011);
  ignore CurrencyLib.addCurrency(currencies, "GBP", "£",  "🇬🇧", "British Pound",     0.0094);

  // --- Seed 4 user levels ---
  ignore EngagementLib.addUserLevel(userLevels, 1, #bronze,   "Bronze",   "🥉", 0,        100000,  1.0, ["1% cashback", "Email support"]);
  ignore EngagementLib.addUserLevel(userLevels, 2, #silver,   "Silver",   "🥈", 100000,   500000,  2.0, ["2% cashback", "Priority support", "5% discount on bundles"]);
  ignore EngagementLib.addUserLevel(userLevels, 3, #gold,     "Gold",     "🥇", 500000,   2000000, 3.5, ["3.5% cashback", "Priority delivery", "10% discount on bundles", "Free refill on recommended"]);
  ignore EngagementLib.addUserLevel(userLevels, 4, #platinum, "Platinum", "💎", 2000000,  0,       5.0, ["5% cashback", "Dedicated account manager", "15% discount on all", "Free refill guarantee", "First access to new services"]);

  // --- Seed wallet reward config ---
  ignore EngagementLib.addWalletReward(walletRewards, 1, #daily,     1000, 0.0,  "daily");    // 10 INR daily
  ignore EngagementLib.addWalletReward(walletRewards, 2, #referral,  0,    5.0,  "per_order");// 5% referral
  ignore EngagementLib.addWalletReward(walletRewards, 3, #cashback,  0,    2.0,  "per_order");// 2% cashback

  // --- Seed global pricing rule ---
  ignore EngagementLib.addPricingRule(pricingRules, 1, [], 1.0, 1.25, 1.875, []);

  // --- Mixin includes ---
  include UsersApi(users, orders);
  include ServicesApi(services, users);
  include OrdersApi(orders, wallets, transactions, services, users, notifications);
  include WalletApi(wallets, transactions, users);
  include SubsApi(plans, subscriptions);
  include ApiKeysApi(apiKeys);
  include TicketsApi(tickets, ticketMessages, users, notifications);
  include NotifsApi(notifications);
  include AdminApi(users, orders, wallets, transactions, services, providers, adminLogs, fraudAlerts, adminConfig);
  include TiersApi(serviceTiers, users);
  include BundlesApi(bundles, users);
  include CurrenciesApi(currencies, users);
  include EngagementApi(users, wallets, transactions, userLevels, walletRewards, engagementLogs, coupons, referrals, reviews, pricingRules);
};
