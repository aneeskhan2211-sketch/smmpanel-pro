import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { SubscriptionPlan } from "@/hooks/useSubscription";
import {
  useCancelSubscription,
  useMySubscription,
  useSubscribeToPlan,
  useSubscriptionPlans,
} from "@/hooks/useSubscription";
import {
  Check,
  Crown,
  Loader2,
  RefreshCw,
  Rocket,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Static plan definitions ─────────────────────────────────────────────────
const PLAN_META: Record<
  string,
  {
    icon: React.ReactNode;
    gradient: string;
    borderClass: string;
    badge?: string;
    deliveryPriority: string;
    color: string;
  }
> = {
  free: {
    icon: <Shield className="w-6 h-6" />,
    gradient: "from-muted/40 to-muted/20",
    borderClass: "border-border",
    deliveryPriority: "Standard",
    color: "text-muted-foreground",
  },
  pro: {
    icon: <Rocket className="w-6 h-6" />,
    gradient: "from-primary/20 to-primary/5",
    borderClass: "border-primary",
    badge: "Most Popular",
    deliveryPriority: "Priority",
    color: "text-primary",
  },
  premium: {
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-accent/20 to-primary/10",
    borderClass: "border-accent",
    badge: "Best Value",
    deliveryPriority: "Express",
    color: "text-accent-foreground",
  },
};

const FEATURES_TABLE = [
  { label: "All Services", free: true, pro: true, premium: true },
  { label: "API Access", free: false, pro: false, premium: true },
  { label: "Order Discount", free: "None", pro: "15%", premium: "25%" },
  {
    label: "Delivery Priority",
    free: "Standard",
    pro: "Priority",
    premium: "Express",
  },
  {
    label: "Support",
    free: "Community",
    pro: "Email",
    premium: "Priority Chat",
  },
  { label: "Analytics Dashboard", free: false, pro: true, premium: true },
  { label: "Bulk Orders", free: false, pro: true, premium: true },
  { label: "Auto-Refill", free: false, pro: false, premium: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-4 h-4 text-accent mx-auto" />
    ) : (
      <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
    );
  }
  return (
    <span className="text-xs font-medium text-foreground/80">{value}</span>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6 space-y-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  isMostPopular: boolean;
  autoRenew: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isLoading: boolean;
}

function PlanCard({
  plan,
  isCurrentPlan,
  isMostPopular,
  onSelect,
  isLoading,
}: PlanCardProps) {
  const tier = plan.tier.toLowerCase() as string;
  const meta = PLAN_META[tier] ?? PLAN_META.free;
  const isPopular = isMostPopular || meta.badge === "Most Popular";
  const isPremium = tier === "premium";
  const isFree = tier === "free";
  const price = Number(plan.priceMonthly);
  const discount = Number(plan.discountPercent);

  const actionLabel = isCurrentPlan
    ? "Current Plan"
    : isFree
      ? "Downgrade"
      : "Upgrade";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col"
    >
      {meta.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge
            className={`px-3 py-1 text-xs font-semibold ${
              isPopular
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground"
            } shadow-elevated`}
          >
            {isPopular && <Sparkles className="w-3 h-3 mr-1" />}
            {meta.badge}
          </Badge>
        </div>
      )}
      <div
        className={`flex flex-col h-full rounded-xl border bg-gradient-to-b ${
          meta.gradient
        } ${meta.borderClass} ${
          isCurrentPlan
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
            : ""
        } ${
          isPopular ? "shadow-elevated glow-primary" : ""
        } transition-smooth hover:-translate-y-1 p-6 space-y-5`}
        data-ocid={`subscriptions.plan_card.${tier}`}
      >
        {/* Header */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${meta.color}`}>
            {meta.icon}
            <span className="font-display font-bold text-lg text-foreground">
              {plan.name}
            </span>
          </div>
          <div className="flex items-end gap-1">
            {price === 0 ? (
              <span className="text-4xl font-display font-extrabold text-foreground">
                Free
              </span>
            ) : (
              <>
                <span className="text-3xl font-display font-extrabold text-foreground">
                  ₹{price}
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  /month
                </span>
              </>
            )}
          </div>
          {discount > 0 && (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                <Zap className="w-3 h-3 mr-0.5" />
                {discount}% off all orders
              </Badge>
              {isPremium && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-accent/20 text-accent-foreground border-accent/30"
                >
                  <Rocket className="w-3 h-3 mr-0.5" />
                  {meta.deliveryPriority}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Feature list */}
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="pt-2">
          {isCurrentPlan ? (
            <Button
              variant="outline"
              className="w-full border-primary text-primary"
              disabled
              data-ocid={`subscriptions.current_plan_button.${tier}`}
            >
              <Check className="w-4 h-4 mr-2" />
              Current Plan
            </Button>
          ) : (
            <Button
              className={`w-full ${
                isPopular
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated glow-primary"
                  : isPremium
                    ? "bg-gradient-to-r from-primary to-accent text-foreground hover:opacity-90"
                    : "variant-outline"
              }`}
              variant={isFree ? "outline" : "default"}
              onClick={() => onSelect(plan)}
              disabled={isLoading}
              data-ocid={`subscriptions.${isFree ? "downgrade" : "upgrade"}_button.${tier}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isFree ? (
                <RefreshCw className="w-4 h-4 mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SubscriptionsPage() {
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: mySubscription, isLoading: subLoading } = useMySubscription();
  const subscribeMutation = useSubscribeToPlan();
  const cancelMutation = useCancelSubscription();

  const [autoRenew, setAutoRenew] = useState(mySubscription?.autoRenew ?? true);
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isLoading = plansLoading || subLoading;
  const currentPlanId = mySubscription?.planId;

  // Sort plans: free → pro → premium
  const sortedPlans = [...(plans ?? [])].sort((a, b) => {
    const order: Record<string, number> = { free: 0, pro: 1, premium: 2 };
    return (
      (order[a.tier.toLowerCase()] ?? 0) - (order[b.tier.toLowerCase()] ?? 0)
    );
  });

  function handleSelectPlan(plan: SubscriptionPlan) {
    if (plan.tier.toLowerCase() === "free") {
      setShowCancelModal(true);
    } else {
      setConfirmPlan(plan);
    }
  }

  async function handleConfirmUpgrade() {
    if (!confirmPlan) return;
    try {
      await subscribeMutation.mutateAsync({
        planId: confirmPlan.id,
        autoRenew,
      });
      toast.success(`Subscribed to ${confirmPlan.name}!`);
      setConfirmPlan(null);
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    }
  }

  async function handleCancelSubscription() {
    try {
      await cancelMutation.mutateAsync();
      toast.success(
        "Subscription cancelled. You've been moved to the Free plan.",
      );
      setShowCancelModal(false);
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    }
  }

  const nextBillingDate = mySubscription?.endDate
    ? new Date(Number(mySubscription.endDate) / 1_000_000).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : null;

  return (
    <div
      data-ocid="subscriptions.page"
      className="space-y-10 max-w-6xl mx-auto"
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-display font-extrabold text-foreground">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground text-sm">
          Unlock better discounts, priority delivery, and more — upgrade
          anytime.
        </p>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {isLoading
          ? ["free", "pro", "premium"].map((sk) => (
              <PlanCardSkeleton key={sk} />
            ))
          : sortedPlans.map((plan, i) => {
              const tier = plan.tier.toLowerCase();
              return (
                <motion.div
                  key={plan.id.toString()}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <PlanCard
                    plan={plan}
                    isCurrentPlan={currentPlanId === plan.id}
                    isMostPopular={tier === "pro"}
                    autoRenew={autoRenew}
                    onSelect={handleSelectPlan}
                    isLoading={subscribeMutation.isPending}
                  />
                </motion.div>
              );
            })}
      </div>

      {/* Auto-renew section */}
      {mySubscription?.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Auto-Renew</p>
                  {nextBillingDate && (
                    <p className="text-sm text-muted-foreground">
                      Next billing date:{" "}
                      <span className="text-foreground font-medium">
                        {nextBillingDate}
                      </span>
                    </p>
                  )}
                </div>
                <Switch
                  data-ocid="subscriptions.auto_renew_toggle"
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feature comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-0">
            <h2 className="text-lg font-display font-bold text-foreground">
              Feature Comparison
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">
                      Feature
                    </th>
                    {["Free", "Pro", "Premium"].map((col) => (
                      <th
                        key={col}
                        className={`p-4 text-center font-semibold ${
                          col === "Pro"
                            ? "text-primary"
                            : col === "Premium"
                              ? "text-accent-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES_TABLE.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-border/50 ${
                        i % 2 === 0 ? "bg-muted/20" : ""
                      } hover:bg-muted/30 transition-colors`}
                    >
                      <td className="p-4 text-foreground/80">{row.label}</td>
                      <td className="p-4 text-center">
                        <FeatureValue value={row.free} />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={row.pro} />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancel subscription */}
      {mySubscription?.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            type="button"
            data-ocid="subscriptions.cancel_subscription_link"
            className="text-sm text-muted-foreground hover:text-destructive underline underline-offset-4 transition-colors cursor-pointer"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel subscription
          </button>
        </motion.div>
      )}

      {/* Upgrade confirmation dialog */}
      <Dialog
        open={!!confirmPlan}
        onOpenChange={(open) => !open && setConfirmPlan(null)}
      >
        <DialogContent
          data-ocid="subscriptions.upgrade_dialog"
          className="bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Upgrade to {confirmPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You'll be charged{" "}
              <span className="text-foreground font-semibold">
                ₹{Number(confirmPlan?.priceMonthly ?? 0)}/month
              </span>
              .
              {Number(confirmPlan?.discountPercent ?? 0) > 0 && (
                <>
                  {" "}
                  You'll save{" "}
                  <span className="text-primary font-semibold">
                    {Number(confirmPlan?.discountPercent)}% on all orders
                  </span>
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="subscriptions.upgrade_cancel_button"
              onClick={() => setConfirmPlan(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="subscriptions.upgrade_confirm_button"
              onClick={handleConfirmUpgrade}
              disabled={subscribeMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent
          data-ocid="subscriptions.cancel_dialog"
          className="bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-destructive">
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You'll lose all plan benefits immediately and be moved to the Free
              plan. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="subscriptions.cancel_dialog_dismiss_button"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Plan
            </Button>
            <Button
              variant="destructive"
              data-ocid="subscriptions.cancel_confirm_button"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
