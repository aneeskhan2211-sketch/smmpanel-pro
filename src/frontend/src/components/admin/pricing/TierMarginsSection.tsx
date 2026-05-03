import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIERS = [
  {
    key: "basic",
    label: "Basic",
    defaultMargin: 0,
    badge: "⚡ Fast Delivery",
    badgeClass: "bg-muted text-muted-foreground",
    accentClass: "text-muted-foreground",
    borderClass: "border-border",
    desc: "Market-competitive pricing. Good for entry orders.",
  },
  {
    key: "recommended",
    label: "Recommended",
    defaultMargin: 25,
    badge: "🔥 Most Popular",
    badgeClass: "bg-accent/20 text-accent border-accent/30",
    accentClass: "text-accent",
    borderClass: "border-accent/40",
    desc: "Better retention, faster support. Default selection.",
  },
  {
    key: "premium",
    label: "Premium",
    defaultMargin: 87.5,
    badge: "💎 Best Quality",
    badgeClass: "bg-primary/20 text-primary border-primary/30",
    accentClass: "text-primary",
    borderClass: "border-primary/40",
    desc: "High retention, refill guarantee, priority processing.",
  },
];

function calcPrice(baseCost: number, marginPct: number) {
  return Math.round(baseCost * (1 + marginPct / 100));
}

export function TierMarginsSection() {
  const [margins, setMargins] = useState<Record<string, string>>({
    basic: "0",
    recommended: "25",
    premium: "87.5",
  });
  const exampleCost = 100;

  function applyMargin(key: string) {
    const val = Number.parseFloat(margins[key] ?? "0");
    if (Number.isNaN(val) || val < 0) {
      toast.error("Enter a valid non-negative margin.");
      return;
    }
    toast.success(
      `${key.charAt(0).toUpperCase() + key.slice(1)} margin updated to ${val}%`,
    );
  }

  return (
    <Card
      className="p-5 space-y-4"
      data-ocid="admin.pricing.tier_margins.section"
    >
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">
          Service Tier Margins
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Set the markup percentage applied on top of provider cost for each tier.
        Example below uses ₹100 provider cost.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const marginVal = Number.parseFloat(margins[tier.key] ?? "0") || 0;
          const price = calcPrice(exampleCost, marginVal);
          const profit = price - exampleCost;
          return (
            <div
              key={tier.key}
              className={`rounded-xl border ${tier.borderClass} bg-card/60 p-4 space-y-3 flex flex-col`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-display font-semibold text-sm ${tier.accentClass}`}
                >
                  {tier.label}
                </span>
                <Badge className={`text-xs ${tier.badgeClass}`}>
                  {tier.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{tier.desc}</p>
              <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Provider cost</span>
                  <span className="text-foreground font-mono">
                    ₹{exampleCost}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Selling price</span>
                  <span
                    className={`font-mono font-semibold ${tier.accentClass}`}
                  >
                    ₹{price}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Net profit</span>
                  <span className="font-mono text-accent">+₹{profit}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Margin %"
                  value={margins[tier.key]}
                  onChange={(e) =>
                    setMargins((prev) => ({
                      ...prev,
                      [tier.key]: e.target.value,
                    }))
                  }
                  className="flex-1 h-8 text-sm"
                  data-ocid={`admin.pricing.tier_margins.${tier.key}_input`}
                />
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => applyMargin(tier.key)}
                  data-ocid={`admin.pricing.tier_margins.${tier.key}_apply_button`}
                >
                  Apply
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
