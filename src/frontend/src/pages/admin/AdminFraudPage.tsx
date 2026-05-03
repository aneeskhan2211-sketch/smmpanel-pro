import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminConfig,
  useAdminFraudAlerts,
  useAdminResolveFraud,
  useAdminUpdateConfig,
} from "@/hooks/useAdmin";
import type { AdminConfig, FraudAlert } from "@/types/admin";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ExternalLink,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type RiskLevel = "all" | "low" | "medium" | "high";
type ResolvedFilter = "all" | "open" | "resolved";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ALERT_TYPE_LABELS: Record<string, string> = {
  velocity: "High Velocity",
  duplicate_link: "Duplicate Link",
  chargebacks: "Bulk Orders",
  suspicious_ip: "Low Service Ratio",
  bot_pattern: "Bot Pattern",
};

const ALERT_TYPE_COLORS: Record<string, string> = {
  velocity: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  duplicate_link: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  chargebacks: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  suspicious_ip: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  bot_pattern: "bg-destructive/15 text-destructive border-destructive/30",
};

function riskLevelFromScore(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  return "high";
}

function RiskBadge({ score }: { score: number }) {
  if (score <= 30)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-accent/15 text-accent border-accent/30">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        {score}
      </span>
    );
  if (score <= 60)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        {score}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-destructive/15 text-destructive border-destructive/30">
      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
      {score}
    </span>
  );
}

const ACTION_COLORS: Record<string, string> = {
  "Order blocked": "bg-destructive/15 text-destructive border-destructive/30",
  "Flagged for review": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Whitelisted: "bg-accent/15 text-accent border-accent/30",
  resolved: "bg-accent/15 text-accent border-accent/30",
  whitelist: "bg-accent/15 text-accent border-accent/30",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
  flagged: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

function actionLabel(action: string): string {
  if (action === "Order blocked") return "Blocked";
  if (action === "Flagged for review") return "Flagged";
  return action.charAt(0).toUpperCase() + action.slice(1);
}

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  idx,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07 }}
    >
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {label}
              </p>
              <p className="text-2xl font-display font-bold text-foreground mt-1">
                {value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────
function FilterBar({
  riskLevel,
  alertType,
  resolvedFilter,
  dateFrom,
  dateTo,
  onRisk,
  onType,
  onResolved,
  onDateFrom,
  onDateTo,
}: {
  riskLevel: RiskLevel;
  alertType: string;
  resolvedFilter: ResolvedFilter;
  dateFrom: string;
  dateTo: string;
  onRisk: (v: RiskLevel) => void;
  onType: (v: string) => void;
  onResolved: (v: ResolvedFilter) => void;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Risk Level */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border">
        {(["all", "low", "medium", "high"] as RiskLevel[]).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onRisk(lvl)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth capitalize ${
              riskLevel === lvl
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`admin.fraud.filter.risk.${lvl}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Alert Type */}
      <Select value={alertType} onValueChange={onType}>
        <SelectTrigger
          className="h-9 w-44 text-xs"
          data-ocid="admin.fraud.filter.type_select"
        >
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="velocity">High Velocity</SelectItem>
          <SelectItem value="duplicate_link">Duplicate Link</SelectItem>
          <SelectItem value="chargebacks">Bulk Orders</SelectItem>
          <SelectItem value="suspicious_ip">Low Service Ratio</SelectItem>
          <SelectItem value="bot_pattern">Bot Pattern</SelectItem>
        </SelectContent>
      </Select>

      {/* Resolved Status */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border">
        {(["all", "open", "resolved"] as ResolvedFilter[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onResolved(r)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth capitalize ${
              resolvedFilter === r
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`admin.fraud.filter.resolved.${r}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFrom(e.target.value)}
          className="h-9 text-xs w-36 bg-card border-border"
          data-ocid="admin.fraud.filter.date_from"
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateTo(e.target.value)}
          className="h-9 text-xs w-36 bg-card border-border"
          data-ocid="admin.fraud.filter.date_to"
        />
      </div>
    </div>
  );
}

// ─── Fraud Rules Panel ────────────────────────────────────────────────────────
function FraudRulesPanel() {
  const { data: config, isLoading } = useAdminConfig();
  const updateConfig = useAdminUpdateConfig();

  const [form, setForm] = useState({
    fraudVelocityLimit: 10,
    maxConcurrentOrdersPerLink: 3,
    fraudDuplicateLinkThreshold: 3,
    minUserAgeDays: 0,
  });

  useEffect(() => {
    if (config) {
      setForm({
        fraudVelocityLimit: config.fraudVelocityLimit,
        maxConcurrentOrdersPerLink: config.maxConcurrentOrdersPerLink,
        fraudDuplicateLinkThreshold: config.fraudDuplicateLinkThreshold,
        minUserAgeDays: config.minUserAgeDays,
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(form as Partial<AdminConfig>, {
      onSuccess: () => toast.success("Fraud rules updated"),
      onError: () => toast.error("Failed to update rules"),
    });
  };

  const fields: {
    key: keyof typeof form;
    label: string;
    hint: string;
    min: number;
    max: number;
  }[] = [
    {
      key: "fraudVelocityLimit",
      label: "Velocity Limit",
      hint: "Max orders per hour",
      min: 1,
      max: 100,
    },
    {
      key: "maxConcurrentOrdersPerLink",
      label: "Max Concurrent Orders / Link",
      hint: "Active orders on same link",
      min: 1,
      max: 20,
    },
    {
      key: "fraudDuplicateLinkThreshold",
      label: "Duplicate Link Threshold",
      hint: "Orders on same link before flag",
      min: 1,
      max: 20,
    },
    {
      key: "minUserAgeDays",
      label: "Min User Age (days)",
      hint: "Account age for high-value orders",
      min: 0,
      max: 365,
    },
  ];

  return (
    <Card className="border-border bg-card" data-ocid="admin.fraud.rules_panel">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-display font-semibold">
              Fraud Detection Rules
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure automatic detection thresholds
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label
                    htmlFor={`rule-${f.key}`}
                    className="text-xs font-medium"
                  >
                    {f.label}
                  </Label>
                  <Input
                    id={`rule-${f.key}`}
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [f.key]: Number(e.target.value),
                      }))
                    }
                    className="h-9 bg-background border-border text-sm"
                    data-ocid={`admin.fraud.rule.${f.key}`}
                  />
                  <p className="text-xs text-muted-foreground">{f.hint}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={handleSave}
                disabled={updateConfig.isPending}
                data-ocid="admin.fraud.rules.save_button"
              >
                <Save className="h-3.5 w-3.5" />
                {updateConfig.isPending ? "Saving…" : "Save Rules"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function AdminFraudPage() {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("all");
  const [alertType, setAlertType] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<ResolvedFilter>("open");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: alerts = [], isLoading } = useAdminFraudAlerts();
  const resolveFraud = useAdminResolveFraud();

  // ── Derived summary stats ─────────────────────────────────────────────────
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const thisMonthAlerts = alerts.filter((a) => a.timestamp >= monthAgo);
  const highRisk = thisMonthAlerts.filter((a) => a.riskScore > 60);
  const blocked = alerts.filter(
    (a) => a.actionTaken === "Order blocked" || a.actionTaken === "blocked",
  );
  const whitelisted = alerts.filter(
    (a) => a.actionTaken === "Whitelisted" || a.actionTaken === "whitelist",
  );

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filtered = alerts.filter((a) => {
    if (riskLevel !== "all" && riskLevelFromScore(a.riskScore) !== riskLevel)
      return false;
    if (alertType !== "all" && a.alertType !== alertType) return false;
    if (resolvedFilter === "open" && a.resolved) return false;
    if (resolvedFilter === "resolved" && !a.resolved) return false;
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (a.timestamp < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      if (a.timestamp > to) return false;
    }
    return true;
  });

  const handleAction = (
    alert: FraudAlert,
    action: "whitelist" | "resolved",
  ) => {
    resolveFraud.mutate(
      { alertId: alert.id, action },
      {
        onSuccess: () =>
          toast.success(
            action === "whitelist"
              ? `User ${alert.userId} whitelisted`
              : `Alert ${alert.id} resolved`,
          ),
        onError: () => toast.error("Action failed. Try again."),
      },
    );
  };

  const summaries = [
    {
      label: "Total Alerts (Month)",
      value: thisMonthAlerts.length,
      icon: AlertTriangle,
      color: "bg-primary/15 text-primary",
    },
    {
      label: "High Risk Alerts",
      value: highRisk.length,
      icon: ShieldAlert,
      color: "bg-destructive/15 text-destructive",
    },
    {
      label: "Blocked Orders",
      value: blocked.length,
      icon: Ban,
      color: "bg-orange-500/15 text-orange-400",
    },
    {
      label: "Whitelisted Users",
      value: whitelisted.length,
      icon: Users,
      color: "bg-accent/15 text-accent",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="admin.fraud.page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <ShieldX className="h-6 w-6 text-destructive" />
            Fraud Detection
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Monitor, review and resolve suspicious activity across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium text-destructive">
              {alerts.filter((a) => !a.resolved).length} open
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/30 bg-accent/10">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-accent">
              {alerts.filter((a) => a.resolved).length} resolved
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map((s, i) => (
          <SummaryCard key={s.label} {...s} idx={i} />
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="border-border bg-card/50">
        <CardContent className="pt-4 pb-4">
          <FilterBar
            riskLevel={riskLevel}
            alertType={alertType}
            resolvedFilter={resolvedFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onRisk={setRiskLevel}
            onType={setAlertType}
            onResolved={setResolvedFilter}
            onDateFrom={setDateFrom}
            onDateTo={setDateTo}
          />
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Fraud Alerts
              <Badge variant="secondary" className="text-xs">
                {filtered.length}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3 px-0 pb-0">
          {isLoading ? (
            <div
              className="px-5 pb-5 space-y-3"
              data-ocid="admin.fraud.loading_state"
            >
              {["a", "b", "c", "d", "e"].map((k) => (
                <Skeleton key={k} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="py-16 text-center"
              data-ocid="admin.fraud.empty_state"
            >
              <ShieldCheck className="h-12 w-12 text-accent mx-auto mb-3 opacity-50" />
              <p className="text-foreground font-medium">All clear!</p>
              <p className="text-muted-foreground text-sm mt-1">
                No alerts match the current filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground pl-5">
                      Alert ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      User
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Alert Type
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground text-right">
                      Risk Score
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Order ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Action Taken
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Resolved
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground pr-5 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((alert, i) => (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-border transition-colors ${
                        alert.resolved
                          ? "opacity-60 bg-muted/5"
                          : "hover:bg-muted/10"
                      }`}
                      data-ocid={`admin.fraud.item.${i + 1}`}
                    >
                      <TableCell className="pl-5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {alert.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(alert.timestamp).toLocaleDateString()}
                          <br />
                          <span className="text-muted-foreground/60">
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-foreground">
                          {alert.userId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap ${
                            ALERT_TYPE_COLORS[alert.alertType] ?? ""
                          }`}
                        >
                          {ALERT_TYPE_LABELS[alert.alertType] ??
                            alert.alertType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <RiskBadge score={alert.riskScore} />
                      </TableCell>
                      <TableCell>
                        {alert.orderId ? (
                          <span className="font-mono text-xs text-primary">
                            {alert.orderId}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap ${
                            ACTION_COLORS[alert.actionTaken] ??
                            "bg-muted/20 text-muted-foreground border-border"
                          }`}
                        >
                          {actionLabel(alert.actionTaken)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <span className="flex items-center gap-1 text-xs text-accent">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          {!alert.resolved && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
                                onClick={() => handleAction(alert, "whitelist")}
                                disabled={resolveFraud.isPending}
                                data-ocid={`admin.fraud.whitelist_button.${i + 1}`}
                              >
                                Whitelist
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleAction(alert, "resolved")}
                                disabled={resolveFraud.isPending}
                                data-ocid={`admin.fraud.resolve_button.${i + 1}`}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                          {alert.orderId && (
                            <a
                              href={`/admin/orders?id=${alert.orderId}`}
                              className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-smooth"
                              data-ocid={`admin.fraud.view_order_link.${i + 1}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Order
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fraud Rules Configuration */}
      <FraudRulesPanel />
    </div>
  );
}
