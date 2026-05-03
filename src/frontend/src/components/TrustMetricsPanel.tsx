import type { ServicePublic } from "@/backend";
import { cn } from "@/lib/utils";
import { RefreshCw, Shield, Star, TrendingUp, Zap } from "lucide-react";

interface TrustMetricsPanelProps {
  service: ServicePublic;
  className?: string;
}

function MetricBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    pct >= 80 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function TrustMetricsPanel({
  service,
  className,
}: TrustMetricsPanelProps) {
  const successRate = Number(service.successRate);
  const retentionScore = Number(service.retentionScore);
  const deliveryHours = Number(service.deliveryTimeHours);
  const deliveryLabel =
    deliveryHours < 24
      ? `${deliveryHours}h`
      : `${Math.round(deliveryHours / 24)}d`;

  const supportLabel =
    service.refillPolicy === "guaranteed"
      ? "Priority"
      : service.refillPolicy === "limited"
        ? "Standard"
        : "Basic";

  const metrics = [
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: `${successRate}%`,
      score: successRate,
      color: "text-success",
    },
    {
      icon: Star,
      label: "Retention Score",
      value: `${retentionScore}%`,
      score: retentionScore,
      color: "text-primary",
    },
    {
      icon: Zap,
      label: "Delivery",
      value: deliveryLabel,
      score: deliveryHours < 24 ? 90 : deliveryHours < 48 ? 70 : 50,
      color: "text-warning",
    },
    {
      icon: RefreshCw,
      label: "Refill",
      value:
        service.refillPolicy === "guaranteed"
          ? "✓ Guaranteed"
          : service.refillPolicy === "limited"
            ? "Limited"
            : "None",
      score:
        service.refillPolicy === "guaranteed"
          ? 100
          : service.refillPolicy === "limited"
            ? 60
            : 20,
      color: "text-accent",
    },
    {
      icon: Shield,
      label: "Support",
      value: supportLabel,
      score:
        supportLabel === "Priority"
          ? 100
          : supportLabel === "Standard"
            ? 70
            : 40,
      color: "text-info",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 p-4 space-y-3",
        className,
      )}
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Trust Metrics
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", m.color)} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
              <MetricBar value={m.score} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
