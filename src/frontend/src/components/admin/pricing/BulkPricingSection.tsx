import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
  "All Services",
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "Telegram",
  "Website",
  "Business",
];

const SAMPLE_PREVIEW = [
  { name: "Instagram Followers", before: 150, after: 0 },
  { name: "Instagram Reels Views", before: 62, after: 0 },
  { name: "YouTube Views", before: 225, after: 0 },
  { name: "YouTube Subscribers", before: 312, after: 0 },
  { name: "TikTok Followers", before: 162, after: 0 },
];

export function BulkPricingSection() {
  const [platform, setPlatform] = useState("All Services");
  const [percent, setPercent] = useState("");
  const [preview, setPreview] = useState<
    { name: string; before: number; after: number }[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);

  function handlePreview() {
    const pct = Number.parseFloat(percent);
    if (Number.isNaN(pct)) {
      toast.error("Enter a valid percentage.");
      return;
    }
    const updated = SAMPLE_PREVIEW.map((r) => ({
      ...r,
      after: Math.round(r.before * (1 + pct / 100)),
    }));
    setPreview(updated);
    setShowPreview(true);
  }

  function handleApply() {
    const pct = Number.parseFloat(percent);
    toast.success(
      `Bulk ${pct > 0 ? `+${pct}` : pct}% applied to ${
        platform === "All Services" ? "all services" : `${platform} services`
      }.`,
    );
    setPercent("");
    setShowPreview(false);
    setPreview([]);
  }

  return (
    <Card className="p-5 space-y-4" data-ocid="admin.pricing.bulk.section">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">
          Bulk Pricing Action
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger
            className="sm:w-52"
            data-ocid="admin.pricing.bulk.platform_select"
          >
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            %
          </span>
          <Input
            type="number"
            placeholder="e.g. 10 or -5"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="pl-7"
            data-ocid="admin.pricing.bulk.percent_input"
          />
        </div>
        <Button
          variant="outline"
          onClick={handlePreview}
          data-ocid="admin.pricing.bulk.preview_button"
        >
          <Eye className="h-4 w-4 mr-1" /> Preview Changes
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={!percent || Number.isNaN(Number.parseFloat(percent))}
              data-ocid="admin.pricing.bulk.apply_button"
            >
              Apply Bulk Change
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="admin.pricing.bulk.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Pricing Change</AlertDialogTitle>
              <AlertDialogDescription>
                Apply <strong>{percent}%</strong> price change to{" "}
                <strong>{platform}</strong>? This will update selling prices for
                all affected services. Provider costs remain unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="admin.pricing.bulk.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApply}
                data-ocid="admin.pricing.bulk.confirm_button"
              >
                Confirm Apply
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {showPreview && preview.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Preview — {platform} ({Number.parseFloat(percent) > 0 ? "+" : ""}
            {percent}%)
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">Service</th>
                  <th className="text-right px-3 py-2 font-medium">Before</th>
                  <th className="text-right px-3 py-2 font-medium">After</th>
                  <th className="text-right px-3 py-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.map((row) => {
                  const delta = row.after - row.before;
                  return (
                    <tr key={row.name} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-foreground">{row.name}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        ₹{row.before}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">
                        ₹{row.after}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${
                          delta > 0
                            ? "text-accent"
                            : delta < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}₹{delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
