import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Database, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ServiceRow {
  id: string;
  name: string;
  platform: string;
  providerCost: number;
}

const MOCK_SERVICES: ServiceRow[] = [
  {
    id: "1",
    name: "Instagram Followers",
    platform: "Instagram",
    providerCost: 120,
  },
  {
    id: "2",
    name: "Instagram Indian Followers",
    platform: "Instagram",
    providerCost: 95,
  },
  {
    id: "3",
    name: "Instagram Reels Views",
    platform: "Instagram",
    providerCost: 50,
  },
  {
    id: "4",
    name: "Instagram Story Views",
    platform: "Instagram",
    providerCost: 65,
  },
  { id: "5", name: "YouTube Views", platform: "YouTube", providerCost: 180 },
  {
    id: "6",
    name: "YouTube Subscribers",
    platform: "YouTube",
    providerCost: 250,
  },
  {
    id: "7",
    name: "YouTube Shorts Views",
    platform: "YouTube",
    providerCost: 140,
  },
  {
    id: "8",
    name: "Facebook Page Likes",
    platform: "Facebook",
    providerCost: 110,
  },
  { id: "9", name: "TikTok Followers", platform: "TikTok", providerCost: 130 },
  {
    id: "10",
    name: "Telegram Members",
    platform: "Telegram",
    providerCost: 200,
  },
  {
    id: "11",
    name: "India Website Traffic",
    platform: "Website",
    providerCost: 75,
  },
  { id: "12", name: "Google Reviews", platform: "Business", providerCost: 500 },
];

const PLATFORMS = [
  "All",
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "Telegram",
  "Website",
  "Business",
];

function calcTier(cost: number, m: number) {
  return Math.round(cost * m);
}

export function ProviderCostManager() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [costs, setCosts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      MOCK_SERVICES.map((s) => [s.id, String(s.providerCost)]),
    ),
  );
  const [sortKey, setSortKey] = useState<"name" | "providerCost" | "profit">(
    "name",
  );
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let rows = MOCK_SERVICES.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchPlatform = platform === "All" || s.platform === platform;
      return matchSearch && matchPlatform;
    });
    rows = [...rows].sort((a, b) => {
      const ca = Number(costs[a.id]) || a.providerCost;
      const cb = Number(costs[b.id]) || b.providerCost;
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "providerCost") cmp = ca - cb;
      else cmp = calcTier(ca, 1.875) - calcTier(cb, 1.875);
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [search, platform, costs, sortKey, sortAsc]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc((p) => !p);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function saveCost(id: string, name: string) {
    const val = Number(costs[id]);
    if (!val || val <= 0) {
      toast.error("Enter a valid provider cost.");
      return;
    }
    toast.success(`Cost saved for ${name} — ₹${val}`);
  }

  const SortBtn = ({ col, label }: { col: typeof sortKey; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      data-ocid={`admin.pricing.provider_cost.sort_${col}_button`}
    >
      {label}
      {sortKey === col ? (sortAsc ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <Card
      className="p-5 space-y-4"
      data-ocid="admin.pricing.provider_cost.section"
    >
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">
          Provider Cost Manager
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
            data-ocid="admin.pricing.provider_cost.search_input"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-smooth ${
                platform === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              }`}
              data-ocid="admin.pricing.provider_cost.platform_filter"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground">
              <th className="text-left px-3 py-2.5 font-medium">
                <SortBtn col="name" label="Service" />
              </th>
              <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">
                Platform
              </th>
              <th className="text-right px-3 py-2.5 font-medium">
                <SortBtn col="providerCost" label="Provider Cost" />
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden md:table-cell">
                Basic (1×)
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden md:table-cell">
                Rec. (1.25×)
              </th>
              <th className="text-right px-3 py-2.5 font-medium">
                <SortBtn col="profit" label="Premium (1.875×)" />
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden lg:table-cell">
                Net Profit %
              </th>
              <th className="text-right px-3 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => {
              const cost = Number(costs[s.id]) || s.providerCost;
              const basic = calcTier(cost, 1);
              const rec = calcTier(cost, 1.25);
              const prem = calcTier(cost, 1.875);
              const profitPct = Math.round(((prem - cost) / cost) * 100);
              return (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-foreground font-medium">
                    {s.name}
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Badge className="bg-muted/60 text-muted-foreground text-xs">
                      {s.platform}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      type="number"
                      min="1"
                      value={costs[s.id]}
                      onChange={(e) =>
                        setCosts((prev) => ({
                          ...prev,
                          [s.id]: e.target.value,
                        }))
                      }
                      className="h-7 text-xs text-right w-20 ml-auto"
                      data-ocid="admin.pricing.provider_cost.cost_input"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground hidden md:table-cell">
                    ₹{basic}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-accent hidden md:table-cell">
                    ₹{rec}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-primary font-semibold">
                    ₹{prem}
                  </td>
                  <td className="px-3 py-2 text-right hidden lg:table-cell">
                    <span className="text-accent">+{profitPct}%</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => saveCost(s.id, s.name)}
                      data-ocid="admin.pricing.provider_cost.save_button"
                    >
                      Save
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.pricing.provider_cost.empty_state"
          >
            No services match your filters.
          </div>
        )}
      </div>
    </Card>
  );
}
