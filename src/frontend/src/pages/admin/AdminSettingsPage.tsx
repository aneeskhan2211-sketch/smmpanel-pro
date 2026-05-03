import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAdminConfig, useAdminUpdateConfig } from "@/hooks/useAdmin";
import type { AdminConfig } from "@/types/admin";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  GitBranch,
  Lock,
  Save,
  Settings2,
  ShieldAlert,
  Sliders,
  ToggleRight,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Section dirty state hook ─────────────────────────────────────────────────
function useDirtySection<T extends object>(
  initial: T | null,
): {
  local: T | null;
  dirty: boolean;
  set: (updater: (prev: T) => T) => void;
  reset: (next: T) => void;
} {
  const [local, setLocal] = useState<T | null>(null);
  const [dirty, setDirty] = useState(false);
  const baseRef = useRef<T | null>(null);

  useEffect(() => {
    if (initial && !baseRef.current) {
      baseRef.current = initial;
      setLocal(initial);
      setDirty(false);
    }
  }, [initial]);

  const set = (updater: (prev: T) => T) => {
    setLocal((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      setDirty(JSON.stringify(next) !== JSON.stringify(baseRef.current));
      return next;
    });
  };

  const reset = (next: T) => {
    baseRef.current = next;
    setLocal(next);
    setDirty(false);
  };

  return { local, dirty, set, reset };
}

// ─── Sub-types per section ────────────────────────────────────────────────────
type MarginForm = Pick<AdminConfig, "globalMarginPercent">;
type LimitsForm = Pick<
  AdminConfig,
  "maxOrdersPerUserPerDay" | "maxConcurrentOrdersPerLink" | "minUserAgeDays"
>;
type RefundForm = Pick<AdminConfig, "autoRefundHours">;
type FraudForm = Pick<
  AdminConfig,
  "fraudVelocityLimit" | "fraudDuplicateLinkThreshold"
>;
type FeatureForm = Pick<
  AdminConfig,
  "subscriptionsEnabled" | "referralsEnabled"
>;

// ─── Dirty dot ────────────────────────────────────────────────────────────────
function DirtyDot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      title="Unsaved changes"
      aria-label="Unsaved changes"
      className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-1.5"
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  description,
  dirty,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  dirty?: boolean;
}) {
  return (
    <CardHeader className="pb-3 border-b border-border/60">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground flex items-center">
            {title}
            {dirty !== undefined && <DirtyDot show={dirty} />}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </CardHeader>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SettingsSkeleton() {
  const skKeys = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"];
  return (
    <div className="space-y-5" data-ocid="admin.settings.loading_state">
      {skKeys.map((k) => (
        <Skeleton key={k} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Save footer ──────────────────────────────────────────────────────────────
function SaveFooter({
  dirty,
  pending,
  label,
  ocid,
  onSave,
}: {
  dirty: boolean;
  pending: boolean;
  label: string;
  ocid: string;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        className="gap-1.5"
        disabled={!dirty || pending}
        onClick={onSave}
        data-ocid={ocid}
      >
        <Save className="h-3.5 w-3.5" />
        {label}
      </Button>
    </div>
  );
}

// ─── Rate limit stat card ─────────────────────────────────────────────────────
function RateStat({
  Icon,
  value,
  label,
}: {
  Icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-muted/30 border border-border/40 p-3 text-center">
      <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
      <p className="font-mono font-bold text-foreground text-lg leading-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const { data: config, isLoading } = useAdminConfig();
  const updateConfig = useAdminUpdateConfig();

  const margin = useDirtySection<MarginForm>(
    config ? { globalMarginPercent: config.globalMarginPercent } : null,
  );
  const limits = useDirtySection<LimitsForm>(
    config
      ? {
          maxOrdersPerUserPerDay: config.maxOrdersPerUserPerDay,
          maxConcurrentOrdersPerLink: config.maxConcurrentOrdersPerLink,
          minUserAgeDays: config.minUserAgeDays,
        }
      : null,
  );
  const refund = useDirtySection<RefundForm>(
    config ? { autoRefundHours: config.autoRefundHours } : null,
  );
  const fraud = useDirtySection<FraudForm>(
    config
      ? {
          fraudVelocityLimit: config.fraudVelocityLimit,
          fraudDuplicateLinkThreshold: config.fraudDuplicateLinkThreshold,
        }
      : null,
  );
  const [features, setFeatures] = useState<FeatureForm | null>(null);
  useEffect(() => {
    if (config && !features) {
      setFeatures({
        subscriptionsEnabled: config.subscriptionsEnabled,
        referralsEnabled: config.referralsEnabled,
      });
    }
  }, [config, features]);

  const mutate = updateConfig.mutate;

  const saveSection = (partial: Partial<AdminConfig>, resetFn: () => void) => {
    mutate(partial, {
      onSuccess: () => {
        toast.success("Saved", { description: "Configuration updated" });
        resetFn();
      },
      onError: () => toast.error("Failed to save"),
    });
  };

  const handleToggle = (field: keyof FeatureForm, value: boolean) => {
    const next = { ...features!, [field]: value };
    setFeatures(next);
    const label =
      field === "subscriptionsEnabled" ? "Subscriptions" : "Referrals";
    mutate(
      { [field]: value },
      {
        onSuccess: () =>
          toast.success(`${label} ${value ? "enabled" : "disabled"}`),
        onError: () => {
          toast.error("Failed to update");
          setFeatures((p) => p && { ...p, [field]: !value });
        },
      },
    );
  };

  const isReady =
    !isLoading &&
    !!config &&
    !!margin.local &&
    !!limits.local &&
    !!refund.local &&
    !!fraud.local &&
    !!features;

  if (!isReady) return <SettingsSkeleton />;

  const marginPct = margin.local!.globalMarginPercent;
  const sampleCost = 10.0;
  const samplePrice = +(sampleCost * (1 + marginPct / 100)).toFixed(2);

  return (
    <div className="space-y-5 max-w-3xl pb-10" data-ocid="admin.settings.page">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Global configuration for pricing, limits, fraud and features
          </p>
        </div>
      </motion.div>

      {/* ── 1. Price Margin ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-border/70">
          <SectionHeader
            icon={DollarSign}
            title="Price Margin Controls"
            description="Global commission applied on top of provider cost."
            dirty={margin.dirty}
          />
          <CardContent className="pt-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="margin-num" className="text-sm font-medium">
                  Global Margin
                </Label>
                <span className="text-sm font-mono font-bold text-primary">
                  {marginPct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={marginPct}
                onChange={(e) =>
                  margin.set((f) => ({
                    ...f,
                    globalMarginPercent: Number(e.target.value),
                  }))
                }
                className="w-full h-2 rounded-full accent-primary cursor-pointer"
                aria-label="Global margin percentage slider"
                data-ocid="admin.settings.margin_slider"
              />
              <div className="flex items-center gap-2">
                <Input
                  id="margin-num"
                  type="number"
                  min={0}
                  max={100}
                  value={marginPct}
                  onChange={(e) =>
                    margin.set((f) => ({
                      ...f,
                      globalMarginPercent: Math.min(
                        100,
                        Math.max(0, Number(e.target.value)),
                      ),
                    }))
                  }
                  className="w-24 h-8 text-sm"
                  data-ocid="admin.settings.margin_input"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            {/* Price preview */}
            <div className="rounded-lg bg-muted/40 border border-border/50 p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>Provider cost example:</span>
                <span className="font-mono font-semibold text-foreground">
                  ₹{sampleCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">→ Your price:</span>
                <span className="font-mono font-bold text-accent text-sm">
                  ₹{samplePrice}
                </span>
                <Badge variant="secondary" className="text-xs">
                  +{marginPct}%
                </Badge>
              </div>
            </div>

            <SaveFooter
              dirty={margin.dirty}
              pending={updateConfig.isPending}
              label="Save Margin"
              ocid="admin.settings.margin_save_button"
              onSave={() =>
                saveSection(margin.local!, () => margin.reset(margin.local!))
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 2. Order Limits ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <Card className="border-border/70">
          <SectionHeader
            icon={Sliders}
            title="Order Limits"
            description="Per-user and per-link guardrails to prevent abuse."
            dirty={limits.dirty}
          />
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="max-daily"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Max Orders / User / Day
                </Label>
                <Input
                  id="max-daily"
                  type="number"
                  min={1}
                  value={limits.local!.maxOrdersPerUserPerDay}
                  onChange={(e) =>
                    limits.set((f) => ({
                      ...f,
                      maxOrdersPerUserPerDay: Number(e.target.value),
                    }))
                  }
                  data-ocid="admin.settings.max_daily_orders_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="max-concurrent"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Max Concurrent / Link
                </Label>
                <Input
                  id="max-concurrent"
                  type="number"
                  min={1}
                  value={limits.local!.maxConcurrentOrdersPerLink}
                  onChange={(e) =>
                    limits.set((f) => ({
                      ...f,
                      maxConcurrentOrdersPerLink: Number(e.target.value),
                    }))
                  }
                  data-ocid="admin.settings.max_concurrent_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="min-age"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Min User Age (days)
                </Label>
                <Input
                  id="min-age"
                  type="number"
                  min={0}
                  value={limits.local!.minUserAgeDays}
                  onChange={(e) =>
                    limits.set((f) => ({
                      ...f,
                      minUserAgeDays: Number(e.target.value),
                    }))
                  }
                  data-ocid="admin.settings.min_age_input"
                />
                <p className="text-xs text-muted-foreground">
                  Days before large orders unlock
                </p>
              </div>
            </div>
            <SaveFooter
              dirty={limits.dirty}
              pending={updateConfig.isPending}
              label="Save Limits"
              ocid="admin.settings.limits_save_button"
              onSave={() =>
                saveSection(limits.local!, () => limits.reset(limits.local!))
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 3. Refund Policy ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/70">
          <SectionHeader
            icon={Clock}
            title="Refund Policy"
            description="Auto-refund trigger window after a failed delivery."
            dirty={refund.dirty}
          />
          <CardContent className="pt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 items-start">
              <div className="space-y-1.5">
                <Label
                  htmlFor="auto-refund"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Auto-Refund After (hours)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="auto-refund"
                    type="number"
                    min={1}
                    max={720}
                    value={refund.local!.autoRefundHours}
                    onChange={(e) =>
                      refund.set((f) => ({
                        ...f,
                        autoRefundHours: Number(e.target.value),
                      }))
                    }
                    className="w-28"
                    data-ocid="admin.settings.auto_refund_input"
                  />
                  <span className="text-sm text-muted-foreground">hrs</span>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border/50 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  How auto-refund works
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If an order remains in a failed or stuck state beyond this
                  window, the full charge is returned to the customer's wallet.
                  The order is marked{" "}
                  <strong className="text-foreground">partial-refund</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Current window:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {refund.local!.autoRefundHours}h
                  </span>{" "}
                  ≈ {(refund.local!.autoRefundHours / 24).toFixed(1)} days
                </p>
              </div>
            </div>
            <SaveFooter
              dirty={refund.dirty}
              pending={updateConfig.isPending}
              label="Save Policy"
              ocid="admin.settings.refund_save_button"
              onSave={() =>
                saveSection(refund.local!, () => refund.reset(refund.local!))
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 4. Feature Toggles ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
      >
        <Card className="border-border/70">
          <SectionHeader
            icon={ToggleRight}
            title="Feature Toggles"
            description="Enable or disable platform features globally. Changes take effect instantly."
          />
          <CardContent className="pt-4 divide-y divide-border/50">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Subscriptions
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow users to upgrade to Pro &amp; Premium plans
                </p>
              </div>
              <Switch
                checked={features.subscriptionsEnabled}
                onCheckedChange={(v) => handleToggle("subscriptionsEnabled", v)}
                data-ocid="admin.settings.subscriptions_switch"
              />
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Referral Program
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Users earn wallet credits for each referred signup
                </p>
              </div>
              <Switch
                checked={features.referralsEnabled}
                onCheckedChange={(v) => handleToggle("referralsEnabled", v)}
                data-ocid="admin.settings.referrals_switch"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 5. Fraud Detection ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        <Card className="border-border/70">
          <SectionHeader
            icon={ShieldAlert}
            title="Fraud Detection Thresholds"
            description="Velocity and duplicate-link triggers for automated fraud blocking."
            dirty={fraud.dirty}
          />
          <CardContent className="pt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="velocity"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Velocity Limit (orders / hr)
                </Label>
                <Input
                  id="velocity"
                  type="number"
                  min={1}
                  value={fraud.local!.fraudVelocityLimit}
                  onChange={(e) =>
                    fraud.set((f) => ({
                      ...f,
                      fraudVelocityLimit: Number(e.target.value),
                    }))
                  }
                  data-ocid="admin.settings.velocity_limit_input"
                />
                <p className="text-xs text-muted-foreground">
                  Orders per hour before account is flagged
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="dup-link"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Duplicate Link Threshold
                </Label>
                <Input
                  id="dup-link"
                  type="number"
                  min={1}
                  value={fraud.local!.fraudDuplicateLinkThreshold}
                  onChange={(e) =>
                    fraud.set((f) => ({
                      ...f,
                      fraudDuplicateLinkThreshold: Number(e.target.value),
                    }))
                  }
                  data-ocid="admin.settings.dup_link_input"
                />
                <p className="text-xs text-muted-foreground">
                  Max same-link orders per user within 24 h
                </p>
              </div>
            </div>
            <SaveFooter
              dirty={fraud.dirty}
              pending={updateConfig.isPending}
              label="Save Thresholds"
              ocid="admin.settings.fraud_save_button"
              onSave={() =>
                saveSection(fraud.local!, () => fraud.reset(fraud.local!))
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 6. API Rate Limits (info only) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <Card className="border-border/60 border-dashed">
          <SectionHeader
            icon={GitBranch}
            title="API Rate Limits"
            description="Current enforced limits for external API consumers."
          />
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RateStat Icon={Zap} value="30" label="Orders / min" />
              <RateStat Icon={DollarSign} value="10" label="Wallet ops / min" />
              <RateStat
                Icon={GitBranch}
                value="120"
                label="Service queries / min"
              />
              <RateStat Icon={Lock} value="5" label="Auth tokens / hr" />
            </div>
            <Separator />
            <div className="flex items-start gap-2 rounded-lg bg-muted/20 border border-dashed border-border/50 p-3">
              <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Read-only display.
                </span>{" "}
                API rate limits are enforced at the infrastructure level. To
                change them, update the canister configuration and redeploy the
                backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
