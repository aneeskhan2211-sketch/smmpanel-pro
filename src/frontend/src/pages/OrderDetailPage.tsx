import { PlatformLogo } from "@/components/PlatformLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STATUS_CONFIG,
  getPlatformFromLink,
  useActiveOrdersPolling,
  useOrderById,
} from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
  Loader2,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import type { ElementType } from "react";

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.color.replace("text-", "bg-")}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${cfg.color.replace("text-", "bg-")}`}
          />
        </span>
      )}
      {cfg.label}
    </span>
  );
};

// ─── Timeline step ────────────────────────────────────────────────────────────
interface TimelineStep {
  label: string;
  description: string;
  reached: boolean;
  active: boolean;
  failed?: boolean;
}

function getTimeline(status: OrderStatus): TimelineStep[] {
  const isFailed = status === "cancelled";
  const isRefunded = status === "refunded" || status === "partial";
  const isActive =
    status === "active" || status === "processing" || status === "pending";
  const isDone = status === "completed";

  return [
    {
      label: "Order Placed",
      description: "Your order was received and queued",
      reached: true,
      active: status === "pending",
    },
    {
      label: "Processing",
      description: "Provider is fulfilling your order",
      reached: [
        "processing",
        "active",
        "completed",
        "cancelled",
        "partial",
        "refunded",
      ].includes(status),
      active: status === "processing" || status === "active",
      failed: isFailed,
    },
    {
      label: isDone
        ? "Completed"
        : isFailed
          ? "Cancelled"
          : isRefunded
            ? "Refunded"
            : "Completed",
      description: isDone
        ? "Order delivered successfully"
        : isFailed
          ? "Order could not be fulfilled"
          : isRefunded
            ? "Partial/refund issued to wallet"
            : "Awaiting completion",
      reached: !isActive,
      active: isDone,
      failed: isFailed || isRefunded,
    },
  ];
}

function Timeline({ status }: { status: OrderStatus }) {
  const steps = getTimeline(status);
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 ${
                  steps[i].reached ? "bg-primary" : "bg-border"
                } transition-smooth`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-smooth ${
                step.active
                  ? "border-primary bg-primary/20"
                  : step.reached && !step.failed
                    ? "border-green-400 bg-green-400/20"
                    : step.reached && step.failed
                      ? "border-red-400 bg-red-400/20"
                      : "border-border bg-muted"
              }`}
            >
              {step.active ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : step.reached && !step.failed ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : step.reached && step.failed ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  steps[i + 1].reached ? "bg-primary" : "bg-border"
                } transition-smooth`}
              />
            )}
          </div>
          <div className="text-center mt-2 px-1">
            <p
              className={`text-xs font-semibold ${
                step.active
                  ? "text-primary"
                  : step.reached && !step.failed
                    ? "text-green-400"
                    : step.reached && step.failed
                      ? "text-red-400"
                      : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug hidden sm:block">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { order: initialOrder, isLoading } = useOrderById(orderId);
  const [order, setOrder] = useState<Order | null>(null);

  if (initialOrder && !order) setOrder(initialOrder);

  const handlePollingUpdate = useCallback(
    (updated: Order[]) => {
      const found = updated.find((o) => o.id === orderId);
      if (found) setOrder(found);
    },
    [orderId],
  );

  useActiveOrdersPolling(order ? [order] : [], handlePollingUpdate);

  if (isLoading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <motion.div
        data-ocid="order_detail.error_state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 space-y-4 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <h2 className="text-xl font-display font-bold">Order not found</h2>
        <p className="text-sm text-muted-foreground">
          This order may have been removed or the ID is incorrect.
        </p>
        <Button
          data-ocid="order_detail.back_button"
          onClick={() => navigate({ to: "/orders" })}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
      </motion.div>
    );
  }

  const platform = getPlatformFromLink(order.link);
  const cfg = STATUS_CONFIG[order.status];
  const progress =
    order.quantity > 0
      ? Math.round(((order.quantity - order.remains) / order.quantity) * 100)
      : 100;
  const isRefundEligible =
    ["pending", "processing"].includes(order.status) &&
    Date.now() - order.createdAt < 1000 * 60 * 60;

  return (
    <motion.div
      data-ocid="order_detail.page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button
          data-ocid="order_detail.back_button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: "/orders" })}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <PlatformLogo platform={platform} size={20} />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold leading-snug">
                {order.serviceName}
              </h1>
              <span className="text-xs font-mono text-muted-foreground">
                #{order.id}
              </span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress bar */}
        {order.status !== "pending" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Delivery progress</span>
              <span className={`font-semibold ${cfg.color}`}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-2">
          <Timeline status={order.status} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order info */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-display font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Order Details
          </h2>
          <InfoRow icon={Hash} label="Order ID" value={`#${order.id}`} mono />
          <InfoRow
            icon={ExternalLink}
            label="Target Link"
            value={
              <a
                href={order.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline truncate max-w-[160px]"
              >
                {order.link.replace(/https?:\/\//, "").slice(0, 22)}…
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            }
          />
          <InfoRow
            icon={Zap}
            label="Quantity"
            value={order.quantity.toLocaleString()}
          />
          <InfoRow
            icon={TrendingUp}
            label="Start Count"
            value={order.startCount.toLocaleString()}
          />
          <InfoRow
            icon={RefreshCw}
            label="Remains"
            value={
              <span
                className={
                  order.remains > 0 ? "text-yellow-400" : "text-green-400"
                }
              >
                {order.remains.toLocaleString()}
              </span>
            }
          />
        </div>

        {/* Payment info */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-display font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Payment & Timing
          </h2>
          <InfoRow
            icon={TrendingUp}
            label="Total Charged"
            value={
              <span className="text-green-400 font-semibold">
                ${order.charge.toFixed(2)}
              </span>
            }
          />
          <InfoRow
            icon={Clock}
            label="Created"
            value={new Date(order.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <InfoRow
            icon={RefreshCw}
            label="Last Updated"
            value={new Date(order.updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <div className="pt-3 mt-1 border-t border-border/40">
            <p
              className={`text-xs ${
                isRefundEligible ? "text-green-400" : "text-muted-foreground"
              }`}
            >
              {isRefundEligible
                ? "✓ This order is eligible for a refund (within 1 hour of placement)"
                : "Refund window has closed for this order"}
            </p>
          </div>
        </div>
      </div>

      {/* Support CTA */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">
            Having an issue with this order?
          </h3>
          <p className="text-xs text-muted-foreground">
            Our support team typically responds within 2 hours.
          </p>
        </div>
        <Button
          data-ocid="order_detail.support_button"
          variant="outline"
          className="gap-2 flex-shrink-0"
          onClick={() => navigate({ to: "/support" })}
        >
          <MessageSquare className="w-4 h-4" />
          Open Support Ticket
        </Button>
      </div>
    </motion.div>
  );
}
