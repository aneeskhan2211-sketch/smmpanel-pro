import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEngagement } from "@/hooks/useEngagement";
import { cn } from "@/lib/utils";
import { Check, Copy, Gift, Loader2, Star, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EngagementWidgetProps {
  referralCode?: string;
  className?: string;
}

export function EngagementWidget({
  referralCode,
  className,
}: EngagementWidgetProps) {
  const { level, coupons, claimedToday, claimDailyReward, spinWheel } =
    useEngagement();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const levelBadgeColor: Record<string, string> = {
    bronze: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    silver: "bg-slate-400/20 text-slate-300 border-slate-400/30",
    gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    platinum: "bg-primary/20 text-primary border-primary/30",
  };

  const levelKey = level?.levelName?.toString() ?? "bronze";
  const levelColor = levelBadgeColor[levelKey] ?? levelBadgeColor.bronze;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-4",
        className,
      )}
      data-ocid="engagement.widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Rewards &amp; Perks
        </h3>
        {level && (
          <Badge
            className={cn(
              "text-xs font-bold border capitalize px-2.5 py-1",
              levelColor,
            )}
          >
            <Star className="h-3 w-3 mr-1" />
            {level.displayName}
          </Badge>
        )}
      </div>

      {/* Daily Reward */}
      <div className="flex items-center justify-between gap-3 bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-accent shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Daily Login Reward
            </p>
            <p className="text-xs text-muted-foreground">
              ₹10 credited to wallet
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={claimedToday || claimDailyReward.isPending}
          onClick={() => claimDailyReward.mutate()}
          className={cn(
            "shrink-0 border-accent/40 text-accent hover:bg-accent/20 min-w-[90px]",
            claimedToday && "opacity-60 cursor-not-allowed",
          )}
          data-ocid="engagement.claim_reward_button"
        >
          {claimDailyReward.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : claimedToday ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" /> Claimed
            </>
          ) : (
            "Claim"
          )}
        </Button>
      </div>

      <Separator className="bg-border/50" />

      {/* Spin Wheel */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Spin Wheel</p>
            <p className="text-xs text-muted-foreground">Win up to ₹500</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => spinWheel.mutate()}
          disabled={spinWheel.isPending}
          className="shrink-0 border-warning/40 text-warning hover:bg-warning/10"
          data-ocid="engagement.spin_wheel_button"
        >
          {spinWheel.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Spin 🎡"
          )}
        </Button>
      </div>

      {/* Referral Code */}
      {referralCode && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Your Referral Code
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm bg-muted px-3 py-2 rounded-lg border border-border text-foreground truncate">
                {referralCode}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
                data-ocid="engagement.copy_referral_button"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Coupons count */}
      {coupons.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Available Coupons</p>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {coupons.length} active
            </Badge>
          </div>
        </>
      )}
    </div>
  );
}
