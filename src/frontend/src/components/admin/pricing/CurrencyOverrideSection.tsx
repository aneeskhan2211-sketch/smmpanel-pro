import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳", defaultRate: 1 },
  { code: "USD", symbol: "$", flag: "🇺🇸", defaultRate: 0.012 },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", defaultRate: 0.044 },
  { code: "OMR", symbol: "﷼", flag: "🇴🇲", defaultRate: 0.0046 },
  { code: "SAR", symbol: "﷼", flag: "🇸🇦", defaultRate: 0.045 },
  { code: "EUR", symbol: "€", flag: "🇪🇺", defaultRate: 0.011 },
  { code: "GBP", symbol: "£", flag: "🇬🇧", defaultRate: 0.0095 },
];

const TIER_BASE_INR = [
  { tier: "Basic", price: 100 },
  { tier: "Recommended", price: 125 },
  { tier: "Premium", price: 187.5 },
];

type RateMap = Record<string, string>;

export function CurrencyOverrideSection() {
  const [rates, setRates] = useState<RateMap>(() =>
    Object.fromEntries(CURRENCIES.map((c) => [c.code, String(c.defaultRate)])),
  );

  function resetToAuto(code: string) {
    const def = CURRENCIES.find((c) => c.code === code);
    if (!def) return;
    setRates((prev) => ({ ...prev, [code]: String(def.defaultRate) }));
    toast.success(`${code} rate reset to default (${def.defaultRate})`);
  }

  function saveRates() {
    toast.success("Currency exchange rate overrides saved.");
  }

  return (
    <Card className="p-5 space-y-4" data-ocid="admin.pricing.currency.section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Currency-Wise Price Override
          </h2>
        </div>
        <Button
          size="sm"
          onClick={saveRates}
          data-ocid="admin.pricing.currency.save_button"
        >
          Save Rates
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Set the exchange rate multiplier per currency. Prices auto-convert from
        INR base pricing.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground">
              <th className="text-left px-3 py-2.5 font-medium">Currency</th>
              <th className="text-right px-3 py-2.5 font-medium">
                Exchange Rate (× INR)
              </th>
              {TIER_BASE_INR.map((t) => (
                <th key={t.tier} className="text-right px-3 py-2.5 font-medium">
                  {t.tier} ({"₹"}
                  {t.price})
                </th>
              ))}
              <th className="text-center px-3 py-2.5 font-medium">Reset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CURRENCIES.map((c) => {
              const rate = Number.parseFloat(rates[c.code]) || c.defaultRate;
              return (
                <tr
                  key={c.code}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-semibold text-foreground">
                        {c.code}
                      </span>
                      <span className="text-muted-foreground">{c.symbol}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={rates[c.code]}
                      onChange={(e) =>
                        setRates((prev) => ({
                          ...prev,
                          [c.code]: e.target.value,
                        }))
                      }
                      className="h-7 text-xs text-right w-24 ml-auto"
                      data-ocid="admin.pricing.currency.rate_input"
                    />
                  </td>
                  {TIER_BASE_INR.map((t) => (
                    <td
                      key={t.tier}
                      className="px-3 py-2 text-right font-mono text-muted-foreground"
                    >
                      {c.symbol}
                      {(t.price * rate).toFixed(2)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => resetToAuto(c.code)}
                      data-ocid="admin.pricing.currency.reset_button"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
