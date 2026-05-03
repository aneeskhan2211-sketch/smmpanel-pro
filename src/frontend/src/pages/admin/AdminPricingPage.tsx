import { BulkPricingSection } from "@/components/admin/pricing/BulkPricingSection";
import { CurrencyOverrideSection } from "@/components/admin/pricing/CurrencyOverrideSection";
import { PricingHistorySection } from "@/components/admin/pricing/PricingHistorySection";
import { ProfitCalculatorSection } from "@/components/admin/pricing/ProfitCalculatorSection";
import { ProviderCostManager } from "@/components/admin/pricing/ProviderCostManager";
import { TierMarginsSection } from "@/components/admin/pricing/TierMarginsSection";
import type { AdminPricingStats } from "@/types/admin";
import { TrendingUp } from "lucide-react";

const _stats: AdminPricingStats = {
  totalServices: 62,
  avgBasicMargin: 1.0,
  avgRecommendedMargin: 1.25,
  avgPremiumMargin: 1.875,
  topRevenueService: "Instagram Followers – Premium",
  premiumOrderPercent: 38,
};

export function AdminPricingPage() {
  return (
    <div className="p-4 md:p-6 space-y-6" data-ocid="admin.pricing.page">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Pricing Control Center
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage tier margins, provider costs, bulk updates, and currency
            overrides.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Services", value: "62", color: "text-foreground" },
          {
            label: "Basic Margin",
            value: "1.00×",
            color: "text-muted-foreground",
          },
          { label: "Rec. Margin", value: "1.25×", color: "text-accent" },
          { label: "Premium Margin", value: "1.875×", color: "text-primary" },
          {
            label: "Top Service",
            value: "IG Followers",
            color: "text-foreground",
          },
          { label: "Premium Orders", value: "38%", color: "text-accent" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-card border border-border p-3 text-center"
          >
            <p
              className={`font-display font-bold text-base ${s.color} truncate`}
            >
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <TierMarginsSection />
      <ProviderCostManager />
      <ProfitCalculatorSection />
      <BulkPricingSection />
      <CurrencyOverrideSection />
      <PricingHistorySection />
    </div>
  );
}
