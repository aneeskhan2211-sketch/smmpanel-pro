import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBundles } from "@/hooks/useBundles";
import { useCurrencyStore } from "@/store/currencyStore";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Package,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

// ─── Comparison Table ────────────────────────────────────────────────────────

const COMPARISON_COLUMNS = [
  {
    key: "value",
    label: "Value",
    emoji: "💰",
    subtitle: "Best price per service",
    badge: null as string | null,
    features: [
      "Basic quality",
      "Standard delivery",
      "Limited refill",
      "Email support",
      "Entry-level retention",
    ],
  },
  {
    key: "popular",
    label: "Popular",
    emoji: "🔥",
    subtitle: "Most ordered packs",
    badge: "Most Popular" as string | null,
    features: [
      "Better retention",
      "Faster delivery",
      "30-day refill",
      "Priority support",
      "Trust badges included",
    ],
  },
  {
    key: "premium",
    label: "Premium",
    emoji: "💎",
    subtitle: "Max quality & safety",
    badge: "Best Quality" as string | null,
    features: [
      "High retention",
      "Natural delivery speed",
      "Refill guarantee",
      "Dedicated support",
      "Safer growth profile",
    ],
  },
];

function ComparisonTable() {
  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 space-y-5"
      data-ocid="bundles.comparison.section"
    >
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-xl text-foreground">
          Which bundle tier suits you?
        </h2>
        <p className="text-sm text-muted-foreground">
          Every bundle available in 3 quality tiers — same services, better
          outcomes as you upgrade
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {COMPARISON_COLUMNS.map((col, i) => (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-4 flex flex-col gap-3 ${
              col.key === "popular"
                ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-secondary/30"
            }`}
            data-ocid={`bundles.comparison.${col.key}`}
          >
            <div className="text-center">
              <span className="text-2xl">{col.emoji}</span>
              <p className="font-display font-bold text-sm text-foreground mt-1">
                {col.label}
              </p>
              <p className="text-xs text-muted-foreground">{col.subtitle}</p>
              {col.badge && (
                <Badge
                  className={`mt-2 text-xs ${
                    col.key === "popular"
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-accent/20 text-accent-foreground border-accent/30"
                  }`}
                >
                  {col.badge}
                </Badge>
              )}
            </div>
            <Separator className="opacity-30" />
            <ul className="space-y-1.5">
              {col.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                      col.key === "popular"
                        ? "text-primary"
                        : col.key === "premium"
                          ? "text-accent"
                          : "text-muted-foreground"
                    }`}
                  />
                  {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function BundlesHero() {
  const { selectedCurrency } = useCurrencyStore();
  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 md:p-8"
      data-ocid="bundles.hero.section"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> Bundle Deals
          </span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground leading-tight">
            Save more with <span className="text-primary">bundle packs</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            Curated service bundles designed for maximum impact — get more for
            less, with premium upgrades available for serious growth.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Up to 33% savings
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Zap className="h-3.5 w-3.5" /> Fast delivery included
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Crown className="h-3.5 w-3.5" /> Premium upgrades available
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-5xl font-display font-extrabold text-primary tabular-nums">
            33%
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Max savings vs.
            <br />
            individual services
          </p>
          <Badge className="mt-2 bg-accent/20 text-accent-foreground border-accent/30 text-xs">
            {selectedCurrency.flag} {selectedCurrency.code} pricing
          </Badge>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Service map ─────────────────────────────────────────────────────────────

const SERVICE_DETAILS: Record<
  string,
  { label: string; qty: string; icon: string }
> = {
  followers: { label: "Instagram Followers", qty: "1,000", icon: "👥" },
  likes: { label: "Instagram Likes", qty: "500", icon: "❤️" },
  views: { label: "Video Views", qty: "5,000", icon: "👁️" },
  reels_views: { label: "Reels Views", qty: "10,000", icon: "🎬" },
  reels_likes: { label: "Reels Likes", qty: "1,000", icon: "❤️" },
  saves: { label: "Post Saves", qty: "500", icon: "🔖" },
  shares: { label: "Story Shares", qty: "300", icon: "↗️" },
  yt_views: { label: "YouTube Views", qty: "5,000", icon: "▶️" },
  yt_likes: { label: "YouTube Likes", qty: "500", icon: "👍" },
  yt_subs: { label: "YouTube Subscribers", qty: "200", icon: "🔔" },
  web_traffic: { label: "Website Traffic", qty: "10,000", icon: "🌐" },
  google_reviews: { label: "Google Reviews", qty: "10", icon: "⭐" },
  social_eng: { label: "Social Engagement", qty: "2,000", icon: "💬" },
  comments: { label: "Custom Comments", qty: "50", icon: "💭" },
  profile_visits: { label: "Profile Visits", qty: "2,000", icon: "🔍" },
  content_tips: { label: "Content Suggestions", qty: "5 tips", icon: "📋" },
};

const BUNDLE_SERVICE_MAP: Record<string, string[]> = {
  "Starter Growth Pack": ["followers", "likes", "views"],
  "Reels Viral Pack": ["reels_views", "reels_likes", "saves", "shares"],
  "YouTube Growth Pack": ["yt_views", "yt_likes", "yt_subs"],
  "Business Boost Pack": ["web_traffic", "google_reviews", "social_eng"],
  "Premium Brand Pack": [
    "followers",
    "comments",
    "profile_visits",
    "content_tips",
  ],
};

// ─── Bundle Card ─────────────────────────────────────────────────────────────

type BundleWithDisplay = ReturnType<typeof useBundles>["bundles"][number];

function BundleCard({
  bundle,
  index,
}: {
  bundle: BundleWithDisplay;
  index: number;
}) {
  const navigate = useNavigate();
  const { formatAmount } = useCurrencyStore();

  const serviceKeys = BUNDLE_SERVICE_MAP[bundle.name] ?? [];

  const deliveryDays =
    Number(bundle.estimatedDeliveryHours) < 24
      ? `${Number(bundle.estimatedDeliveryHours)}h`
      : `${Math.ceil(Number(bundle.estimatedDeliveryHours) / 24)} days`;

  const premiumPrice = Math.round(Number(bundle.discountedPrice) * 1.5);
  const isPopular = bundle.badge === "🔥 Most Popular";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative flex flex-col rounded-2xl border bg-card transition-shadow duration-200 hover:shadow-2xl hover:shadow-primary/10 ${
        isPopular ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      }`}
      data-ocid={`bundles.item.${index + 1}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30">
            🔥 Most Popular
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{bundle.imageEmoji}</span>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-foreground text-base leading-tight">
                {bundle.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {bundle.description}
              </p>
            </div>
          </div>
          {bundle.badge && !isPopular && (
            <Badge className="shrink-0 bg-secondary/60 text-secondary-foreground border-border text-xs">
              {bundle.badge}
            </Badge>
          )}
        </div>

        {/* Included services */}
        <div
          className="rounded-xl bg-secondary/30 border border-border/50 p-3 space-y-2"
          data-ocid={`bundles.services.${index + 1}`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Package className="h-3 w-3" /> What's included
          </p>
          <ul className="space-y-1.5">
            {serviceKeys.map((key) => {
              const detail = SERVICE_DETAILS[key];
              if (!detail) return null;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="text-sm leading-none">{detail.icon}</span>
                    {detail.label}
                  </span>
                  <span className="text-primary font-semibold">
                    {detail.qty}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground line-through mb-0.5">
              {bundle.displayOriginalPrice}
            </p>
            <p className="font-display font-extrabold text-3xl text-primary leading-none">
              {bundle.displayDiscountedPrice}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs">
                Save {bundle.savingsPercent}%
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {deliveryDays}
              </span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">
            ⚡ Fast Delivery
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-xs text-accent-foreground">
            ✅ Low Drop Rate
          </span>
          {bundle.hasPremiumUpgrade && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 border border-border px-2 py-0.5 text-xs text-muted-foreground">
              🛡 Refill Available
            </span>
          )}
        </div>

        {/* Premium upgrade teaser */}
        {bundle.hasPremiumUpgrade && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs text-foreground font-medium">
                Premium upgrade
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">High retention</p>
              <p className="text-sm font-bold text-primary">
                {formatAmount(premiumPrice)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="p-4 pt-0 flex flex-col gap-2">
        <Button
          type="button"
          className="w-full min-h-[44px] font-semibold"
          onClick={() => navigate({ to: "/new-order" })}
          data-ocid={`bundles.order_button.${index + 1}`}
        >
          Get Bundle <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        {bundle.hasPremiumUpgrade && (
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] text-primary border-primary/30 hover:bg-primary/10 text-xs"
            onClick={() => navigate({ to: "/new-order" })}
            data-ocid={`bundles.premium_upgrade_button.${index + 1}`}
          >
            <Crown className="mr-1.5 h-3.5 w-3.5" /> Upgrade to Premium —{" "}
            {formatAmount(premiumPrice)}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"];

function BundleSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {SKELETON_KEYS.map((k) => (
        <div
          key={k}
          className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <Skeleton className="h-28 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-11 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function BundlesPage() {
  const { bundles, isLoading } = useBundles();

  return (
    <div
      className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto"
      data-ocid="bundles.page"
    >
      <BundlesHero />

      <ComparisonTable />

      <section data-ocid="bundles.grid.section">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              All Bundle Packs
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading bundles..."
                : `${bundles.length} bundle packs available`}
            </p>
          </div>
          <Badge className="bg-secondary/60 text-secondary-foreground border-border">
            <Package className="mr-1.5 h-3 w-3" /> Bundle savings
          </Badge>
        </div>

        {isLoading ? (
          <BundleSkeletons />
        ) : bundles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card"
            data-ocid="bundles.empty_state"
          >
            <span className="text-5xl mb-4">📦</span>
            <h3 className="font-display font-semibold text-lg text-foreground">
              No bundles available
            </h3>
            <p className="text-muted-foreground mt-1 text-sm max-w-xs">
              Bundle deals are being curated. Check back soon for exclusive
              packs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bundles.map((b, i) => (
              <BundleCard key={String(b.id)} bundle={b} index={i} />
            ))}
          </div>
        )}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-6 text-center space-y-3"
        data-ocid="bundles.cta.section"
      >
        <span className="text-3xl">🚀</span>
        <h2 className="font-display font-bold text-xl text-foreground">
          Premium services. Safer growth.
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Premium bundles are designed for users who want stable, high-retention
          growth that keeps followers engaged long-term.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          {[
            "High Retention",
            "Safer Growth",
            "Refill Included",
            "Priority Delivery",
          ].map((feat) => (
            <span key={feat} className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
              {feat}
            </span>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
