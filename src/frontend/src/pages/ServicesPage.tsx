import { PlatformLogo } from "@/components/PlatformLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_SERVICES, type SortOption } from "@/hooks/useServices";
import { useCurrencyStore } from "@/store/currencyStore";
import { useUIStore } from "@/store/uiStore";
import type { Service, ServiceCategory } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Platform Config ────────────────────────────────────────────────────────
const PLATFORMS: {
  id: ServiceCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "telegram", label: "Telegram" },
  { id: "website", label: "Traffic" },
  { id: "business", label: "Business" },
  { id: "ai", label: "AI Tools" },
];

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] =
  [
    {
      id: "cheapest",
      label: "Cheapest",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    { id: "fastest", label: "Fastest", icon: <Zap className="w-3.5 h-3.5" /> },
    {
      id: "best_quality",
      label: "Best Quality",
      icon: <Star className="w-3.5 h-3.5" />,
    },
  ];

// ─── Tier Config ──────────────────────────────────────────────────────────────────
type TierKey = "basic" | "recommended" | "premium";

const TIER_CONFIG: Record<
  TierKey,
  {
    label: string;
    badge: string | null;
    badgeClass: string;
    ringClass: string;
    priceClass: string;
    btnClass: string;
    features: string[];
  }
> = {
  basic: {
    label: "Basic",
    badge: null,
    badgeClass: "",
    ringClass: "border-border/60",
    priceClass: "text-muted-foreground",
    btnClass: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    features: ["Fast delivery", "Limited refill", "Standard support"],
  },
  recommended: {
    label: "Recommended",
    badge: "🔥 Most Popular",
    badgeClass: "bg-accent/20 text-accent border border-accent/40",
    ringClass: "border-accent/50 ring-2 ring-accent/25 shadow-lg",
    priceClass: "text-accent",
    btnClass:
      "bg-accent hover:bg-accent/90 text-accent-foreground font-semibold",
    features: [
      "Better retention",
      "Faster support",
      "Refill available",
      "Priority queue",
    ],
  },
  premium: {
    label: "Premium",
    badge: "💎 Best Quality",
    badgeClass: "bg-primary/20 text-primary border border-primary/40",
    ringClass: "border-primary/50 ring-1 ring-primary/20",
    priceClass: "text-primary",
    btnClass:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-primary",
    features: [
      "High retention",
      "Safer growth",
      "Refill included",
      "Priority delivery",
      "Dedicated support",
    ],
  },
};

const COMPARISON_ROWS = [
  {
    label: "Delivery Speed",
    values: { basic: "Standard", recommended: "Fast", premium: "Natural" },
  },
  {
    label: "Retention Score",
    values: { basic: "Moderate", recommended: "Good", premium: "High" },
  },
  {
    label: "Refill Support",
    values: {
      basic: "Limited",
      recommended: "Available",
      premium: "Guaranteed",
    },
  },
  {
    label: "Priority Queue",
    values: { basic: "No", recommended: "Yes", premium: "Yes" },
  },
  {
    label: "Support Level",
    values: {
      basic: "Standard",
      recommended: "Priority",
      premium: "Dedicated",
    },
  },
] as const;

// ─── Tier Selector (inline – works with Service from @/types) ───────────────────────────
function TierSelector({
  service,
  selectedTier,
  onTierChange,
  onOrder,
}: {
  service: Service;
  selectedTier: TierKey;
  onTierChange: (t: TierKey) => void;
  onOrder: (t: TierKey) => void;
}) {
  const [showComparison, setShowComparison] = useState(false);
  const { formatAmount } = useCurrencyStore();

  const tierPrices: Record<TierKey, number> = {
    basic: service.basicPrice ?? service.pricePerThousand,
    recommended: service.recommendedPrice ?? service.pricePerThousand * 1.25,
    premium: service.premiumPrice ?? service.pricePerThousand * 1.875,
  };

  return (
    <div className="space-y-3">
      {/* 3-column tier grid */}
      <div className="grid grid-cols-3 gap-2">
        {(["basic", "recommended", "premium"] as TierKey[]).map((tier) => {
          const cfg = TIER_CONFIG[tier];
          const isSelected = selectedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              data-ocid={`services.${tier}_tier`}
              aria-pressed={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onTierChange(tier);
              }}
              className={`relative flex flex-col rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? cfg.ringClass
                  : "border-border/40 opacity-75 hover:opacity-100 hover:border-border"
              }`}
            >
              {/* Badge */}
              {cfg.badge && (
                <span
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    cfg.badgeClass
                  }`}
                >
                  {cfg.badge}
                </span>
              )}
              {/* Label */}
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 mt-1">
                {cfg.label}
              </span>
              {/* Price */}
              <span
                className={`font-display font-bold text-base leading-none ${cfg.priceClass}`}
              >
                {formatAmount(tierPrices[tier])}
                <span className="text-[9px] text-muted-foreground font-normal ml-0.5">
                  /1k
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Premium microcopy */}
      {selectedTier === "premium" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2"
        >
          <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-primary/90 leading-relaxed">
            Premium services are designed for users who want stable growth,
            better retention, and safer delivery.
          </p>
        </motion.div>
      )}

      {/* Compare tiers toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowComparison((v) => !v);
        }}
        data-ocid="services.compare_tiers_toggle"
        className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-smooth py-0.5"
      >
        {showComparison ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {showComparison ? "Hide" : "Compare"} Tiers
      </button>

      {/* Comparison table */}
      {showComparison && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-[10px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-2 py-1.5 text-muted-foreground font-medium">
                  Feature
                </th>
                {(["basic", "recommended", "premium"] as TierKey[]).map((t) => (
                  <th
                    key={t}
                    className={`px-2 py-1.5 text-center font-semibold capitalize ${
                      t === selectedTier
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {TIER_CONFIG[t].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-t border-border/50 ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {row.label}
                  </td>
                  {(["basic", "recommended", "premium"] as TierKey[]).map(
                    (t) => (
                      <td
                        key={t}
                        className={`px-2 py-1.5 text-center ${
                          t === selectedTier
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {row.values[t]}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order CTA */}
      <Button
        type="button"
        size="sm"
        data-ocid="services.order_button"
        className={`w-full text-sm ${TIER_CONFIG[selectedTier].btnClass}`}
        onClick={(e) => {
          e.stopPropagation();
          onOrder(selectedTier);
        }}
      >
        Order {TIER_CONFIG[selectedTier].label} →
      </Button>
    </div>
  );
}

// ─── Premium Service Card ───────────────────────────────────────────────────────────
interface ServiceCardProps {
  service: Service;
  index: number;
  onOrder: (service: Service, tier: TierKey) => void;
}

function ServiceCard({ service, index, onOrder }: ServiceCardProps) {
  const [selectedTier, setSelectedTier] = useState<TierKey>("recommended");
  const pos = index + 1;

  // Trust badge logic
  const trustBadges: string[] = [];
  if (service.retentionScore && service.retentionScore >= 90)
    trustBadges.push("💎 High Retention");
  if (service.speed === "fast") trustBadges.push("⚡ Fast Delivery");
  if (service.refillPolicy === "guaranteed")
    trustBadges.push("🛡 Refill Guarantee");
  if (service.successRate && service.successRate >= 97)
    trustBadges.push("✅ Low Drop Rate");

  return (
    <motion.div
      data-ocid={`services.item.${pos}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.35) }}
      className="group relative bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
          <PlatformLogo platform={service.category} size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-foreground truncate leading-snug">
            {service.name}
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {service.category === "ai" ? "AI Tools" : service.category}
          </p>
        </div>
        {/* Urgency chip */}
        {service.urgencySignal && (
          <motion.span
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
            className="text-[9px] font-bold px-2 py-1 rounded-full bg-warning/15 text-warning border border-warning/30 flex-shrink-0 whitespace-nowrap"
          >
            {service.urgencySignal}
          </motion.span>
        )}
      </div>

      {/* Trust metrics row */}
      <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2">
        <div className="text-center">
          <p className="text-xs font-bold text-accent">
            {service.successRate ?? 95}%
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Success
          </p>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="text-center">
          <p className="text-xs font-bold text-primary">
            {service.retentionScore ?? 80}%
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Retention
          </p>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{service.deliveryTime}</span>
        </div>
        {service.refill && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-accent shrink-0" />
              <span className="text-[9px] text-accent font-medium">Refill</span>
            </div>
          </>
        )}
      </div>

      {/* Trust badges */}
      {trustBadges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {trustBadges.slice(0, 3).map((badge) => (
            <span
              key={badge}
              className="text-[9px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Tier selector */}
      <TierSelector
        service={service}
        selectedTier={selectedTier}
        onTierChange={setSelectedTier}
        onOrder={(tier) => onOrder(service, tier)}
      />
    </motion.div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────────────
function ServiceCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
      <Skeleton className="h-8 rounded-lg" />
    </div>
  );
}

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

// ─── Main Page ──────────────────────────────────────────────────────────────────────
export function ServicesPage() {
  const navigate = useNavigate();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const [platform, setPlatformState] = useState<ServiceCategory | "all">(
    (searchParams.get("platform") as ServiceCategory | "all") ?? "all",
  );
  const [sort, setSortState] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? "best_quality",
  );
  const [isLoading, setIsLoading] = useState(true);

  const { searchQuery } = useUIStore();
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(searchQuery),
      300,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  function setPlatform(p: ServiceCategory | "all") {
    setPlatformState(p);
    const params = new URLSearchParams(window.location.search);
    if (p === "all") params.delete("platform");
    else params.set("platform", p);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  }

  function setSort(s: SortOption) {
    setSortState(s);
    const params = new URLSearchParams(window.location.search);
    params.set("sort", s);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  }

  function handleOrder(service: Service, tier: TierKey) {
    navigate({
      to: "/new-order",
      search: { serviceId: service.id, tier },
    });
  }

  const services = useMemo(() => {
    let list = MOCK_SERVICES;

    if (platform !== "all") {
      list = list.filter((s) => s.category === platform);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }

    if (sort === "cheapest") {
      list = [...list].sort((a, b) => a.pricePerThousand - b.pricePerThousand);
    } else if (sort === "fastest") {
      const ORDER: Record<Service["speed"], number> = {
        fast: 0,
        medium: 1,
        slow: 2,
      };
      list = [...list].sort((a, b) => ORDER[a.speed] - ORDER[b.speed]);
    } else if (sort === "best_quality") {
      list = [...list].sort(
        (a, b) =>
          (b.successRate ?? b.rating * 20) - (a.successRate ?? a.rating * 20),
      );
    }

    return list;
  }, [platform, sort, debouncedSearch]);

  return (
    <div data-ocid="services.page" className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Premium Services
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {MOCK_SERVICES.length}+ growth services • 3 quality tiers • real
              results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary font-semibold">10,000+</span> orders
              delivered
            </div>
          </div>
        </div>

        {/* Premium positioning banner */}
        <div className="mt-4 flex items-start gap-3 bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-primary/20 rounded-xl px-4 py-3">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground font-semibold">
              💎 Recommended tier is pre-selected — optimized balance of
              quality, speed &amp; value.
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Premium = High Retention • Safer Growth • Refill Included •
              Priority Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Filter Toolbar */}
      <div
        data-ocid="services.filter_toolbar"
        className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              data-ocid={`services.platform_tab.${p.id}`}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth flex-shrink-0 ${
                platform === p.id
                  ? "bg-primary text-primary-foreground shadow-sm glow-primary"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <PlatformLogo platform={p.id} size={15} />
              <span>{p.label}</span>
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              data-ocid={`services.sort_tab.${s.id}`}
              type="button"
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth flex-shrink-0 ${
                sort === s.id
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {services.length}
            </span>{" "}
            {services.length === 1 ? "service" : "services"}
            {debouncedSearch.trim() && (
              <>
                {" "}
                for &ldquo;
                <span className="text-primary">{debouncedSearch}</span>&rdquo;
              </>
            )}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
              🔥 Recommended pre-selected
            </span>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div
          data-ocid="services.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SKELETON_KEYS.map((sk) => (
            <ServiceCardSkeleton key={sk} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <motion.div
          data-ocid="services.empty_state"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="font-display font-semibold text-lg text-foreground">
            No services found
          </h3>
          <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-xs">
            Try adjusting your search or switching to a different platform
            filter.
          </p>
          <Button
            data-ocid="services.reset_button"
            variant="outline"
            onClick={() => {
              setPlatform("all");
              useUIStore.getState().setSearchQuery("");
            }}
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${platform}-${sort}-${debouncedSearch}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {services.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={i}
                onOrder={handleOrder}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
