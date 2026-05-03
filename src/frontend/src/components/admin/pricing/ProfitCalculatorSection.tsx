import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { useState } from "react";

function calcTierData(cost: number) {
  const basic = Math.round(cost * 1.0);
  const rec = Math.round(cost * 1.25);
  const prem = Math.round(cost * 1.875);
  return [
    {
      label: "Basic",
      price: basic,
      profit: basic - cost,
      marginPct: 0,
      accentClass: "text-muted-foreground",
      barClass: "bg-muted",
      barW: "40%",
    },
    {
      label: "Recommended",
      price: rec,
      profit: rec - cost,
      marginPct: 25,
      accentClass: "text-accent",
      barClass: "bg-accent",
      barW: "62%",
    },
    {
      label: "Premium",
      price: prem,
      profit: prem - cost,
      marginPct: 87.5,
      accentClass: "text-primary",
      barClass: "bg-primary",
      barW: "100%",
    },
  ];
}

export function ProfitCalculatorSection() {
  const [cost, setCost] = useState(100);
  const tiers = calcTierData(cost);
  const breakEven = Math.round(cost * 1.05);

  return (
    <Card
      className="p-5 space-y-4"
      data-ocid="admin.pricing.calculator.section"
    >
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">
          Profit Margin Calculator
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input side */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="calc-cost"
              className="text-sm font-medium text-foreground"
            >
              Provider Cost (₹)
            </label>
            <input
              id="calc-cost"
              type="range"
              min="10"
              max="1000"
              step="5"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full accent-primary"
              data-ocid="admin.pricing.calculator.cost_slider"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">₹10</span>
              <input
                type="number"
                min="1"
                max="5000"
                value={cost}
                onChange={(e) => setCost(Math.max(1, Number(e.target.value)))}
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                data-ocid="admin.pricing.calculator.cost_input"
              />
              <span className="text-xs text-muted-foreground">₹1000</span>
            </div>
          </div>
          <div className="rounded-xl bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Break-even price
            </p>
            <p className="font-display font-bold text-2xl text-foreground font-mono">
              ₹{breakEven}
            </p>
            <p className="text-xs text-muted-foreground">
              5% buffer above provider cost
            </p>
          </div>
        </div>

        {/* Results side */}
        <div className="space-y-3">
          {tiers.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border border-border bg-card/60 p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-display font-semibold text-sm ${t.accentClass}`}
                >
                  {t.label}
                </span>
                <span
                  className={`font-mono font-bold text-lg ${t.accentClass}`}
                >
                  ₹{t.price}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 mb-2">
                <div
                  className={`h-full rounded-full ${t.barClass} transition-all duration-300`}
                  style={{ width: t.barW }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Net profit:{" "}
                  <span className="text-accent font-mono">+₹{t.profit}</span>
                </span>
                <span>
                  Margin: <span className={t.accentClass}>{t.marginPct}%</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
