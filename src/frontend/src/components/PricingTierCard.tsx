import type { ServicePublic, TierName } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currencyStore";
import { ChevronDown, ChevronUp, RefreshCw, Shield, Zap } from "lucide-react";
import { useState } from "react";

interface PricingTierCardProps {
  service: ServicePublic;
  selectedTier: TierName;
  onTierChange: (tier: TierName) => void;
  onOrder?: (tier: TierName) => void;
  className?: string;
}

const TIER_CONFIG = {
  basic: {
    label: "Basic",
    badge: null,
    badgeClass: "",
    cardClass: "border-border/60 opacity-90",
    btnClass: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    btnLabel: "Book Now",
    multiplier: 1.0,
    deliveryFactor: 1.0,
    features: ["Fast delivery", "Limited refill", "Standard support"],
    retentionLabel: "Standard",
    supportLevel: "Standard",
  },
  recommended: {
    label: "Recommended",
    badge: "🔥 Most Popular",
    badgeClass: "bg-success text-success-foreground",
    cardClass: "border-success/50 ring-2 ring-success/20 shadow-lg",
    btnClass: "bg-success hover:bg-success/90 text-success-foreground",
    btnLabel: "Recommended",
    multiplier: 1.25,
    deliveryFactor: 1.2,
    features: [
      "Better retention",
      "Faster support",
      "Refill available",
      "Priority queue",
    ],
    retentionLabel: "Good",
    supportLevel: "Priority",
  },
  premium: {
    label: "Premium",
    badge: "💎 Best Quality",
    badgeClass: "bg-primary text-primary-foreground",
    cardClass: "border-primary/50 ring-1 ring-primary/20",
    btnClass:
      "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary",
    btnLabel: "Book Now",
    multiplier: 1.875,
    deliveryFactor: 1.5,
    features: [
      "High retention",
      "Safer growth",
      "Refill included",
      "Priority delivery",
      "Dedicated support",
    ],
    retentionLabel: "High",
    supportLevel: "Dedicated",
  },
} as const;

const TIERS: TierName[] = ["basic", "recommended", "premium"] as TierName[];

const COMPARISON_ROWS = [
  { label: "Delivery Speed", key: "delivery" },
  { label: "Retention Score", key: "retention" },
  { label: "Refill Support", key: "refill" },
  { label: "Priority Queue", key: "priority" },
  { label: "Support Level", key: "support" },
] as const;

const COMPARISON_VALUES: Record<TierName, Record<string, string>> = {
  basic: {
    delivery: "Standard",
    retention: "Moderate",
    refill: "Limited",
    priority: "No",
    support: "Standard",
  },
  recommended: {
    delivery: "Fast",
    retention: "Good",
    refill: "Available",
    priority: "Yes",
    support: "Priority",
  },
  premium: {
    delivery: "Natural",
    retention: "High",
    refill: "Guaranteed",
    priority: "Yes",
    support: "Dedicated",
  },
};

function TierColumn({
  tier,
  service,
  selected,
  onSelect,
  onOrder,
}: {
  tier: TierName;
  service: ServicePublic;
  selected: boolean;
  onSelect: () => void;
  onOrder?: () => void;
}) {
  const cfg = TIER_CONFIG[tier];
  const basePPT = Number(service.pricePerThousand);
  const priceINR = basePPT * cfg.multiplier;
  const deliveryHours = Math.round(
    Number(service.deliveryTimeHours) * cfg.deliveryFactor,
  );
  const deliveryLabel =
    deliveryHours < 24
      ? `${deliveryHours}h`
      : `${Math.round(deliveryHours / 24)}d`;
  const { formatAmount } = useCurrencyStore();
  const displayPrice = formatAmount(priceINR);
  const urgency = service.urgencySignal;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex-1 rounded-xl border p-4 text-left transition-smooth cursor-pointer",
        cfg.cardClass,
        selected && "scale-[1.01]",
      )}
      data-ocid={`pricing.${tier}_tier_card`}
      aria-pressed={selected}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="font-display font-bold text-foreground text-base">
          {cfg.label}
        </span>
        {cfg.badge && (
          <Badge className={cn("text-xs shrink-0", cfg.badgeClass)}>
            {cfg.badge}
          </Badge>
        )}
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="font-display font-extrabold text-2xl text-foreground">
          {displayPrice}
        </span>
        <span className="text-xs text-muted-foreground ml-1">/1k</span>
      </div>

      {/* Delivery & metrics */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-warning shrink-0" />
          <span>Delivery {deliveryLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 text-accent shrink-0" />
          <span>Retention: {cfg.retentionLabel}</span>
        </div>
        {service.hasRefill && (
          <div className="flex items-center gap-1.5 text-xs text-accent">
            <Shield className="h-3 w-3 shrink-0" />
            <span>Refill Guarantee</span>
          </div>
        )}
      </div>

      {/* Urgency badges */}
      {urgency && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
            ⚡ {urgency}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3 pt-2 border-t border-border/50">
        <div className="text-center">
          <p className="font-bold text-sm text-foreground">
            {Number(service.successRate)}%
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Success Rate
          </p>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-foreground">
            {service.refillPolicy === "guaranteed"
              ? "✓"
              : service.refillPolicy === "limited"
                ? "~"
                : "✗"}
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Refill
          </p>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-foreground">
            {deliveryHours < 24 ? "High" : deliveryHours < 48 ? "Med" : "Std"}
          </p>
          <p className="text-[9px] text-muted-foreground leading-tight">
            Speed
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button
        type="button"
        size="sm"
        className={cn("w-full text-sm font-semibold", cfg.btnClass)}
        onClick={(e) => {
          e.stopPropagation();
          onOrder?.();
        }}
        data-ocid={`pricing.${tier}_order_button`}
      >
        {cfg.btnLabel}
      </Button>
    </button>
  );
}

export function PricingTierCard({
  service,
  selectedTier,
  onTierChange,
  onOrder,
  className,
}: PricingTierCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className={cn("space-y-4", className)} data-ocid="pricing.tier_card">
      {/* 3-column tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIERS.map((tier) => (
          <TierColumn
            key={tier}
            tier={tier}
            service={service}
            selected={selectedTier === tier}
            onSelect={() => onTierChange(tier)}
            onOrder={() => onOrder?.(tier)}
          />
        ))}
      </div>

      {/* Premium microcopy */}
      {selectedTier === "premium" && (
        <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-primary/90 leading-relaxed">
            Premium services are designed for users who want stable growth,
            better retention, and safer delivery.
          </p>
        </div>
      )}

      {/* Compare tiers toggle */}
      <button
        type="button"
        onClick={() => setShowComparison((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth py-1"
        data-ocid="pricing.compare_tiers_toggle"
      >
        {showComparison ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {showComparison ? "Hide" : "Compare"} Tiers
      </button>

      {/* Comparison table */}
      {showComparison && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                  Feature
                </th>
                {TIERS.map((t) => (
                  <th
                    key={t}
                    className={cn(
                      "px-3 py-2 text-center font-semibold capitalize",
                      t === selectedTier
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {TIER_CONFIG[t].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={cn(
                    "border-t border-border/50",
                    i % 2 === 1 && "bg-muted/20",
                  )}
                >
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.label}
                  </td>
                  {TIERS.map((t) => (
                    <td
                      key={t}
                      className={cn(
                        "px-3 py-2 text-center",
                        t === selectedTier
                          ? "text-primary font-semibold"
                          : "text-foreground",
                      )}
                    >
                      {COMPARISON_VALUES[t][row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
