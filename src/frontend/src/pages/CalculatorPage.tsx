import { createActor } from "@/backend";
import type { Platform, TierName } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePricing } from "@/hooks/usePricing";
import { DEFAULT_CURRENCIES, useCurrencyStore } from "@/store/currencyStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: "instagram" as Platform, label: "Instagram", emoji: "📸" },
  { value: "youtube" as Platform, label: "YouTube", emoji: "🎥" },
  { value: "facebook" as Platform, label: "Facebook", emoji: "👍" },
  { value: "tiktok" as Platform, label: "TikTok", emoji: "🎵" },
  { value: "telegram" as Platform, label: "Telegram", emoji: "📨" },
  { value: "website" as Platform, label: "Website", emoji: "🌐" },
  { value: "twitter" as Platform, label: "Twitter/X", emoji: "🔁" },
  { value: "business" as Platform, label: "Business", emoji: "🏢" },
];

const TIERS: {
  value: TierName;
  label: string;
  badge: string;
  desc: string;
  activeClass: string;
}[] = [
  {
    value: "basic" as TierName,
    label: "Basic",
    badge: "⚡",
    desc: "Fast & affordable",
    activeClass: "border-border bg-muted/60 text-foreground",
  },
  {
    value: "recommended" as TierName,
    label: "Recommended",
    badge: "🔥",
    desc: "Most popular choice",
    activeClass: "border-accent bg-accent/10 text-accent",
  },
  {
    value: "premium" as TierName,
    label: "Premium",
    badge: "💎",
    desc: "Best quality & safety",
    activeClass: "border-primary bg-primary/10 text-primary",
  },
];

const TIER_MULTIPLIERS: Record<TierName, number> = {
  basic: 1.0,
  recommended: 1.25,
  premium: 1.875,
};

const TIER_DELIVERY: Record<TierName, number> = {
  basic: 1.0,
  recommended: 1.2,
  premium: 1.5,
};

const BENEFITS: Record<
  TierName,
  { icon: string; text: string; detail: string }[]
> = {
  basic: [
    {
      icon: "⚡",
      text: "Standard Delivery",
      detail: "Processed in normal queue",
    },
    {
      icon: "🔄",
      text: "Limited Refill",
      detail: "Refill available on request",
    },
    { icon: "💬", text: "Standard Support", detail: "24–48h response time" },
  ],
  recommended: [
    { icon: "📈", text: "Better Retention", detail: "Stays for 30+ days" },
    {
      icon: "🔄",
      text: "Refill Available",
      detail: "Free refill within 30 days",
    },
    { icon: "⚡", text: "Priority Queue", detail: "Faster than standard" },
    { icon: "💬", text: "Priority Support", detail: "12h response time" },
  ],
  premium: [
    { icon: "🛡", text: "High Retention", detail: "40% less account risk" },
    {
      icon: "📈",
      text: "Safer Growth",
      detail: "60% better long-term results",
    },
    {
      icon: "🔄",
      text: "Refill Guarantee",
      detail: "If drops, we refill free",
    },
    {
      icon: "🚀",
      text: "Priority Delivery",
      detail: "Processed first, always",
    },
    {
      icon: "💬",
      text: "24/7 Priority Support",
      detail: "Dedicated response team",
    },
    {
      icon: "💎",
      text: "Best Quality",
      detail: "Real accounts, natural speed",
    },
  ],
};

const WHY_PREMIUM = [
  {
    icon: Shield,
    title: "High Retention",
    description:
      "40% less account risk compared to basic alternatives. Our premium followers stay.",
    stat: "40% less drop",
  },
  {
    icon: TrendingUp,
    title: "Safer Growth",
    description:
      "60% better long-term retention. Gradual, natural delivery protects your account.",
    stat: "60% better retention",
  },
  {
    icon: RefreshCw,
    title: "Refill Guarantee",
    description:
      "If delivery drops below target within 30 days, we refill for free — no questions.",
    stat: "30-day guarantee",
  },
  {
    icon: Zap,
    title: "Priority Delivery",
    description:
      "Your orders are processed before standard and recommended queue. Get results first.",
    stat: "First in queue",
  },
  {
    icon: ShieldCheck,
    title: "24/7 Priority Support",
    description:
      "Dedicated support team for premium users. Avg. response time under 2 hours.",
    stat: "<2h response",
  },
];

// ─── Count-up animation hook ───────────────────────────────────────────────

function useCountUp(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return displayed;
}

// ─── Admin Profit Margin Calculator ───────────────────────────────────────────

function AdminProfitCalculator() {
  const [providerCost, setProviderCost] = useState(1.0);
  const basicSell = providerCost * 1.3;
  const recSell = basicSell * 1.25;
  const premSell = recSell * 1.5;
  const basicProfit = basicSell - providerCost;
  const recProfit = recSell - providerCost;
  const premProfit = premSell - providerCost;
  const basicMargin = ((basicProfit / basicSell) * 100).toFixed(1);
  const recMargin = ((recProfit / recSell) * 100).toFixed(1);
  const premMargin = ((premProfit / premSell) * 100).toFixed(1);

  return (
    <div
      className="rounded-xl border border-border bg-card p-5 space-y-4"
      data-ocid="calculator.admin_profit_panel"
    >
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm">
          Admin Profit Margin Calculator
        </h3>
        <Badge variant="outline" className="text-xs ml-auto">
          Admin Only
        </Badge>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Provider Cost (per 1,000)
        </Label>
        <div className="flex items-center gap-3">
          <span className="text-foreground font-semibold text-sm">₹</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={providerCost}
            onChange={(e) => setProviderCost(Number(e.target.value))}
            className="w-28 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            data-ocid="calculator.provider_cost_input"
          />
          <span className="text-xs text-muted-foreground">INR</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            {
              label: "Basic",
              sell: basicSell,
              profit: basicProfit,
              margin: basicMargin,
              color: "text-muted-foreground",
            },
            {
              label: "Recommended",
              sell: recSell,
              profit: recProfit,
              margin: recMargin,
              color: "text-accent",
            },
            {
              label: "Premium",
              sell: premSell,
              profit: premProfit,
              margin: premMargin,
              color: "text-primary",
            },
          ] as const
        ).map((t) => (
          <div
            key={t.label}
            className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-center"
          >
            <p className={`text-xs font-semibold ${t.color}`}>{t.label}</p>
            <p className="text-sm font-bold text-foreground">
              ₹{t.sell.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Sell price</p>
            <Separator className="my-1" />
            <p className={`text-sm font-bold ${t.color}`}>
              ₹{t.profit.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Net profit</p>
            <p className={`text-xs font-semibold ${t.color}`}>
              {t.margin}% margin
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CalculatorPage() {
  const [platform, setPlatform] = useState<Platform>("instagram" as Platform);
  const [tier, setTier] = useState<TierName>("recommended" as TierName);
  const [quantity, setQuantity] = useState(1000);
  const [selectedServiceId, setSelectedServiceId] = useState<bigint | null>(
    null,
  );
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("INR");
  const [whyOpen, setWhyOpen] = useState(false);
  const [showAdminCalc, setShowAdminCalc] = useState(false);
  const { actor, isFetching } = useActor(createActor);
  const { setCurrency, formatAmount } = useCurrencyStore();
  const navigate = useNavigate();

  const servicesQuery = useQuery({
    queryKey: ["services-by-platform", platform],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServicesByPlatform(platform);
    },
    enabled: !!actor && !isFetching,
  });

  const services = servicesQuery.data ?? [];
  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? services[0] ?? null;

  // Sync currency to store for formatAmount to work
  useEffect(() => {
    setCurrency(selectedCurrencyCode);
  }, [selectedCurrencyCode, setCurrency]);

  const pricing = usePricing(selectedService, tier, quantity);

  // Fallback computation if pricing hook returns null
  const basePPT = selectedService
    ? Number(selectedService.pricePerThousand)
    : 0;
  const tierPPT = basePPT * TIER_MULTIPLIERS[tier];
  const totalINR = (tierPPT / 1000) * quantity;
  const deliveryHours = selectedService
    ? Math.round(
        Number(selectedService.deliveryTimeHours) * TIER_DELIVERY[tier],
      )
    : 0;
  const deliveryLabel =
    deliveryHours > 0
      ? deliveryHours < 24
        ? `${deliveryHours}h`
        : `${Math.round(deliveryHours / 24)} days`
      : "—";

  const displayTotal = pricing ? pricing.tierPrice : totalINR;
  const displayPPT = pricing ? undefined : tierPPT;
  const animatedTotal = useCountUp(displayTotal);

  const selectedCurrency =
    DEFAULT_CURRENCIES.find((c) => c.code === selectedCurrencyCode) ??
    DEFAULT_CURRENCIES[0];

  function handleOrderNow() {
    if (!selectedService) return;
    navigate({
      to: "/new-order",
      search: {
        service: String(selectedService.id),
        quantity: String(quantity),
        tier,
        currency: selectedCurrencyCode,
      },
    });
  }

  return (
    <div
      className="p-4 md:p-6 max-w-6xl mx-auto space-y-6"
      data-ocid="calculator.page"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Smart Price Calculator
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Get exact pricing before you order. Compare tiers, see real
            benefits.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdminCalc((v) => !v)}
          className="text-xs"
          data-ocid="calculator.admin_toggle"
        >
          <DollarSign className="h-3.5 w-3.5 mr-1" />
          {showAdminCalc ? "Hide" : "Show"} Profit Calc
        </Button>
      </div>

      {/* Admin Calculator */}
      <AnimatePresence>
        {showAdminCalc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminProfitCalculator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Left: Form ── */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          {/* Platform */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Platform
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setPlatform(p.value);
                    setSelectedServiceId(null);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all min-h-[44px] ${
                    platform === p.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  data-ocid={`calculator.platform_${p.value}`}
                >
                  <span className="text-lg leading-none">{p.emoji}</span>
                  <span className="leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Service
            </Label>
            <select
              value={selectedService ? String(selectedService.id) : ""}
              onChange={(e) => setSelectedServiceId(BigInt(e.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-ocid="calculator.service_select"
            >
              {services.length === 0 && (
                <option value="">Loading services...</option>
              )}
              {services.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Tier */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Quality Tier
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTier(t.value)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-3 rounded-lg border text-xs font-semibold transition-all min-h-[44px] ${
                    tier === t.value
                      ? `${t.activeClass} shadow-sm`
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                  data-ocid={`calculator.tier_${t.value}`}
                >
                  <span className="text-base">{t.badge}</span>
                  <span>{t.label}</span>
                  {tier === t.value && (
                    <span className="text-[10px] opacity-70 font-normal">
                      {t.desc}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">
                Quantity
              </Label>
              <span className="text-primary font-bold text-sm tabular-nums">
                {quantity.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={selectedService ? Number(selectedService.minQuantity) : 100}
              max={
                selectedService
                  ? Math.min(Number(selectedService.maxQuantity), 100000)
                  : 100000
              }
              step={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer"
              data-ocid="calculator.quantity_slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Min:{" "}
                {selectedService
                  ? Number(selectedService.minQuantity).toLocaleString()
                  : "100"}
              </span>
              <span>
                Max:{" "}
                {selectedService
                  ? Math.min(
                      Number(selectedService.maxQuantity),
                      100000,
                    ).toLocaleString()
                  : "100,000"}
              </span>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Currency
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_CURRENCIES.filter((c) => c.isActive).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrencyCode(c.code)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg border text-xs font-medium transition-all min-h-[44px] ${
                    selectedCurrencyCode === c.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                  data-ocid={`calculator.currency_${c.code.toLowerCase()}`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="font-bold">{c.symbol}</span>
                  <span className="text-[10px] opacity-70">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Results Panel ── */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          data-ocid="calculator.results_panel"
        >
          {/* Price Breakdown */}
          <div className="rounded-xl border border-primary/30 bg-card p-5 space-y-4 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.3)]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                Price Breakdown
              </h3>
              <Badge
                variant="outline"
                className="ml-auto text-xs border-primary/40 text-primary"
              >
                {selectedCurrency.flag} {selectedCurrency.code}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Price per 1,000
                </span>
                <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm">
                  {pricing?.pricePerThousand ?? formatAmount(displayPPT ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-semibold text-foreground">
                  {quantity.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Delivery Time
                </span>
                <span className="font-semibold text-foreground">
                  {pricing?.deliveryLabel ?? deliveryLabel}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold text-foreground">
                  Total Cost
                </span>
                <motion.span
                  key={`${displayTotal}-${selectedCurrencyCode}`}
                  className="font-display font-extrabold text-3xl text-primary tabular-nums"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedCurrency.symbol}
                  {(animatedTotal * selectedCurrency.exchangeRate).toFixed(2)}
                </motion.span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <Clock className="h-4 w-4 text-warning mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">
                  {pricing?.deliveryLabel ?? deliveryLabel}
                </p>
                <p className="text-xs text-muted-foreground">Delivery</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <Zap className="h-4 w-4 text-accent mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">
                  {selectedService
                    ? `${Number(selectedService.successRate)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                Wallet required:
              </span>
              <span className="text-xs font-bold text-foreground ml-auto">
                {selectedCurrency.symbol}
                {(displayTotal * selectedCurrency.exchangeRate).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              {TIERS.find((t) => t.value === tier)?.label} Benefits
            </h3>
            <ul className="space-y-2">
              {BENEFITS[tier].map((b) => (
                <li key={b.text} className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">
                    {b.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {b.text}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {tier !== "basic" && (
              <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-1">
                Premium services are designed for users who want stable growth,
                better retention, and safer delivery.
              </p>
            )}
          </div>

          {/* CTA */}
          <Button
            type="button"
            className="w-full font-semibold text-base py-6 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
            onClick={handleOrderNow}
            disabled={!selectedService}
            data-ocid="calculator.order_now_button"
          >
            <ChevronRight className="h-5 w-5 mr-1" />
            Order Now — {selectedCurrency.symbol}
            {(displayTotal * selectedCurrency.exchangeRate).toFixed(2)}
          </Button>
        </motion.div>
      </div>

      {/* Why Premium? Collapsible */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          data-ocid="calculator.why_premium_toggle"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">
              Why Choose Premium?
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
              5 reasons
            </Badge>
          </div>
          <motion.div
            animate={{ rotate: whyOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {whyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {WHY_PREMIUM.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg bg-muted/30 border border-border p-4 space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-primary border-primary/30 px-1.5 py-0"
                        >
                          {item.stat}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
