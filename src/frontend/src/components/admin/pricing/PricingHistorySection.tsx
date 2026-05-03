import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { History, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ActionType = "margin_change" | "bulk_update" | "currency_override";

interface PricingHistoryEntry {
  id: string;
  date: string;
  actionType: ActionType;
  description: string;
  affectedCount: number;
  appliedBy: string;
  reverted: boolean;
}

const MOCK_HISTORY: PricingHistoryEntry[] = [
  {
    id: "h1",
    date: "2026-05-03 14:22",
    actionType: "margin_change",
    description: "Premium margin updated from 75% → 87.5%",
    affectedCount: 62,
    appliedBy: "admin@panel.io",
    reverted: false,
  },
  {
    id: "h2",
    date: "2026-05-02 09:10",
    actionType: "bulk_update",
    description: "Instagram services +10% bulk price increase",
    affectedCount: 11,
    appliedBy: "admin@panel.io",
    reverted: false,
  },
  {
    id: "h3",
    date: "2026-05-01 17:45",
    actionType: "currency_override",
    description: "AED exchange rate updated: 0.044 → 0.046",
    affectedCount: 62,
    appliedBy: "admin@panel.io",
    reverted: false,
  },
  {
    id: "h4",
    date: "2026-04-30 11:30",
    actionType: "bulk_update",
    description: "YouTube services +5% pricing adjustment",
    affectedCount: 7,
    appliedBy: "admin@panel.io",
    reverted: true,
  },
  {
    id: "h5",
    date: "2026-04-28 08:05",
    actionType: "margin_change",
    description: "Recommended margin updated from 20% → 25%",
    affectedCount: 62,
    appliedBy: "admin@panel.io",
    reverted: false,
  },
];

const ACTION_BADGES: Record<ActionType, { label: string; cls: string }> = {
  margin_change: {
    label: "Margin Change",
    cls: "bg-primary/20 text-primary border-primary/30",
  },
  bulk_update: {
    label: "Bulk Update",
    cls: "bg-accent/20 text-accent border-accent/30",
  },
  currency_override: {
    label: "Currency Override",
    cls: "bg-warning/20 text-warning border-warning/30",
  },
};

export function PricingHistorySection() {
  const [history, setHistory] = useState(MOCK_HISTORY);

  function revert(id: string, desc: string) {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, reverted: true } : h)),
    );
    toast.success(`Reverted: ${desc}`);
  }

  return (
    <Card className="p-5 space-y-4" data-ocid="admin.pricing.history.section">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">
          Pricing Rules History
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs min-w-[540px]">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground">
              <th className="text-left px-3 py-2.5 font-medium">Date</th>
              <th className="text-left px-3 py-2.5 font-medium">Action</th>
              <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">
                Description
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden md:table-cell">
                Affected
              </th>
              <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">
                Applied By
              </th>
              <th className="text-center px-3 py-2.5 font-medium">Revert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map((entry) => {
              const badge = ACTION_BADGES[entry.actionType];
              return (
                <tr
                  key={entry.id}
                  className={`hover:bg-muted/20 transition-colors ${
                    entry.reverted ? "opacity-50" : ""
                  }`}
                  data-ocid="admin.pricing.history.row"
                >
                  <td className="px-3 py-2.5 text-muted-foreground font-mono whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={`text-xs ${badge.cls}`}>
                      {badge.label}
                    </Badge>
                    {entry.reverted && (
                      <Badge className="ml-1 text-xs bg-destructive/20 text-destructive border-destructive/30">
                        Reverted
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-foreground hidden sm:table-cell max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground hidden md:table-cell">
                    {entry.affectedCount} services
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell">
                    {entry.appliedBy}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {!entry.reverted ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => revert(entry.id, entry.description)}
                        data-ocid="admin.pricing.history.revert_button"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Revert
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {history.length === 0 && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.pricing.history.empty_state"
          >
            No pricing rules applied yet.
          </div>
        )}
      </div>
    </Card>
  );
}
