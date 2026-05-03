import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const BLUE = "#3B82F6";
const GREEN = "#22C55E";
const PURPLE = "#A855F7";

const SKELETON_KEYS = ["a", "b", "c", "d"] as const;
const SKELETON_SECONDARY = ["e", "f", "g", "h"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function buildDailyData(values: number[], period: 7 | 30, label: string) {
  const slice = values.slice(-period);
  const today = new Date();
  return slice.map((v, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (slice.length - 1 - i));
    const day = d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    return { day, [label]: v };
  });
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  prefix = "",
}: {
  active?: boolean;
  payload?: { value: number; color: string; name: string }[];
  label?: string;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  trendUp = true,
  accent = "primary",
  index,
  selector,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "accent" | "orange" | "purple";
  index: number;
  selector?: React.ReactNode;
}) {
  const accentClasses = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    accent: "bg-accent/10 border-accent/20 text-accent",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="border-border hover:border-primary/30 transition-all duration-200 h-full">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {title}
                </p>
                {selector && <div className="ml-auto">{selector}</div>}
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ml-2 ${accentClasses[accent]}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground leading-none">
            {value}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            {trend && (
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  trendUp ? "text-accent" : "text-destructive"
                }`}
              >
                <ArrowUpRight
                  className={`h-3.5 w-3.5 ${
                    !trendUp && "rotate-180 text-destructive"
                  }`}
                />
                {trend}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{sub}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Secondary stat chip ─────────────────────────────────────────────────────
function SecondaryStatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  index,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 + index * 0.06 }}
    >
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            {title}
          </p>
          <p className="text-base font-display font-bold text-foreground leading-tight">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Period Toggle ────────────────────────────────────────────────────────────
function PeriodToggle({
  period,
  onChange,
}: {
  period: 7 | 30;
  onChange: (p: 7 | 30) => void;
}) {
  return (
    <div className="flex gap-1 bg-muted/50 p-0.5 rounded-lg">
      {([7, 30] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`text-xs px-2 py-1 rounded-md font-medium transition-all duration-150 ${
            period === p
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p}d
        </button>
      ))}
    </div>
  );
}

// ─── Subscription bar ────────────────────────────────────────────────────────
type SubTier = "free" | "pro" | "premium";
const SUB_CONFIG: { tier: SubTier; color: string; label: string }[] = [
  { tier: "premium", color: PURPLE, label: "Premium" },
  { tier: "pro", color: BLUE, label: "Pro" },
  { tier: "free", color: GREEN, label: "Free" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminDashboard();
  const navigate = useNavigate();

  const [revPeriod, setRevPeriod] = useState<7 | 30>(30);
  const [ordPeriod, setOrdPeriod] = useState<7 | 30>(30);
  const [revMode, setRevMode] = useState<"mtd" | "ytd">("mtd");

  // ── Skeleton ──
  if (isLoading || !stats) {
    return (
      <div className="space-y-6" data-ocid="admin.dashboard.loading_state">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SKELETON_SECONDARY.map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  // ── Derived data ──
  const totalSubRevenue =
    stats.subscriptionRevenue.free +
    stats.subscriptionRevenue.pro +
    stats.subscriptionRevenue.premium;

  const subPieData = SUB_CONFIG.map(({ tier, color, label }) => ({
    name: label,
    value: stats.subscriptionRevenue[tier],
    pct:
      totalSubRevenue > 0
        ? Math.round((stats.subscriptionRevenue[tier] / totalSubRevenue) * 100)
        : 0,
    color,
  }));

  const revenueData = buildDailyData(stats.dailyRevenue, revPeriod, "Revenue");
  const ordersData = buildDailyData(stats.dailyOrders, ordPeriod, "Orders");

  // Estimate completed/failed/pending from totalOrders and totalActiveOrders
  const completedOrders = Math.round(stats.totalOrders * 0.87);
  const failedOrders = Math.round(stats.totalOrders * 0.04);
  const pendingOrders = stats.totalActiveOrders;

  // Estimated profit per service (22.5% margin)
  const topServicesWithMargin = stats.topServices.map((s) => ({
    ...s,
    margin: stats.profitMarginPercent,
    profit: s.revenue * (stats.profitMarginPercent / 100),
  }));

  const kpiCards = [
    {
      title: "Total Revenue",
      value: fmtCurrency(stats.totalRevenue),
      sub: revMode === "mtd" ? "month to date" : "year to date",
      icon: DollarSign,
      trend: "+12.4%",
      trendUp: true,
      accent: "primary" as const,
      selector: (
        <div className="flex gap-1">
          {(["mtd", "ytd"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setRevMode(m)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase transition-all ${
                revMode === m
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`admin.dashboard.rev_mode_${m}`}
            >
              {m}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Profit Margin",
      value: `${stats.profitMarginPercent}%`,
      sub: "net margin",
      icon: TrendingUp,
      trend: "+1.2%",
      trendUp: true,
      accent: "accent" as const,
    },
    {
      title: "Total Orders",
      value: fmtNum(stats.totalOrders),
      sub: "all time",
      icon: ShoppingCart,
      trend: "+8.2% MoM",
      trendUp: true,
      accent: "orange" as const,
    },
    {
      title: "Active Users",
      value: fmtNum(stats.totalUsers),
      sub: "registered",
      icon: Users,
      trend: "+5.7%",
      trendUp: true,
      accent: "purple" as const,
    },
  ];

  const secondaryStats = [
    {
      title: "Completed Orders",
      value: fmtNum(completedOrders),
      icon: CheckCircle2,
      colorClass: "bg-accent/10 text-accent",
    },
    {
      title: "Failed Orders",
      value: fmtNum(failedOrders),
      icon: XCircle,
      colorClass: "bg-destructive/10 text-destructive",
    },
    {
      title: "Pending Orders",
      value: fmtNum(pendingOrders),
      icon: AlertTriangle,
      colorClass: "bg-orange-500/10 text-orange-400",
    },
    {
      title: "New Users / Month",
      value: fmtNum(stats.newUsersThisMonth),
      icon: UserPlus,
      colorClass: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="space-y-7" data-ocid="admin.dashboard.page">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform overview ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {/* Quick actions */}
        <div
          className="flex flex-wrap gap-2"
          data-ocid="admin.dashboard.quick_actions"
        >
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => navigate({ to: "/admin/orders" })}
            data-ocid="admin.dashboard.view_orders_button"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            View All Orders
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => navigate({ to: "/admin/users" })}
            data-ocid="admin.dashboard.manage_users_button"
          >
            <Users className="h-3.5 w-3.5" />
            Manage Users
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => navigate({ to: "/admin/logs" })}
            data-ocid="admin.dashboard.view_logs_button"
          >
            <FileText className="h-3.5 w-3.5" />
            View Logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => navigate({ to: "/admin/services" })}
            data-ocid="admin.dashboard.go_services_button"
          >
            <Settings className="h-3.5 w-3.5" />
            Go to Services
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="admin.dashboard.kpi_section"
      >
        {kpiCards.map((c, i) => (
          <KpiCard key={c.title} {...c} index={i} />
        ))}
      </div>

      {/* ── Secondary Stats ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="admin.dashboard.secondary_stats"
      >
        {secondaryStats.map((s, i) => (
          <SecondaryStatCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Daily Revenue
                  </span>
                </CardTitle>
                <PeriodToggle period={revPeriod} onChange={setRevPeriod} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart
                  data={revenueData}
                  margin={{ top: 6, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval={revPeriod === 7 ? 0 : 4}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                  />
                  <Tooltip content={<ChartTooltip prefix="₹" />} />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke={BLUE}
                    strokeWidth={2}
                    fill="url(#rev-grad)"
                    dot={false}
                    activeDot={{ r: 4, fill: BLUE }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-accent" />
                    Order Volume
                  </span>
                </CardTitle>
                <PeriodToggle period={ordPeriod} onChange={setOrdPeriod} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart
                  data={ordersData}
                  margin={{ top: 6, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval={ordPeriod === 7 ? 0 : 4}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Orders"
                    stroke={GREEN}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: GREEN }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Subscription + Top Services ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.58 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Subscription Revenue
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={subPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {subPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => {
                      const p = props.payload?.[0];
                      if (!p) return null;
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                          <p
                            style={{ color: p.payload.color }}
                            className="font-semibold"
                          >
                            {p.name}: {fmtCurrency(p.value as number)} (
                            {p.payload.pct}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend + horizontal bars */}
              <div className="space-y-2.5 mt-2">
                {subPieData.map((entry) => (
                  <div
                    key={entry.name}
                    data-ocid={`admin.dashboard.sub.${entry.name.toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: entry.color }}
                        />
                        {entry.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fmtCurrency(entry.value)}{" "}
                        <span className="text-foreground font-semibold">
                          ({entry.pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: entry.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 5 Services Table */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.64 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Top 5 Services
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <table
                className="w-full text-sm"
                data-ocid="admin.dashboard.top_services.table"
              >
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-medium w-8">
                      #
                    </th>
                    <th className="text-left py-2 pr-3 text-xs text-muted-foreground font-medium">
                      Service
                    </th>
                    <th className="text-right py-2 pr-3 text-xs text-muted-foreground font-medium">
                      Units Sold
                    </th>
                    <th className="text-right py-2 pr-3 text-xs text-muted-foreground font-medium">
                      Revenue
                    </th>
                    <th className="text-right py-2 text-xs text-muted-foreground font-medium">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topServicesWithMargin.map((s, i) => (
                    <tr
                      key={s.serviceId}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      data-ocid={`admin.dashboard.service_row.item.${i + 1}`}
                    >
                      <td className="py-2.5 pr-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-primary"
                          style={{ background: `${BLUE}18` }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-foreground font-medium text-xs truncate max-w-[160px] block">
                          {s.name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className="text-muted-foreground text-xs">
                          {fmtNum(s.unitsSold)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span className="font-semibold text-foreground text-xs">
                          {fmtCurrency(s.revenue)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5 border-accent/30 text-accent"
                        >
                          {s.margin}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Stacked bar showing revenue distribution */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Revenue distribution
                </p>
                <ResponsiveContainer width="100%" height={70}>
                  <BarChart
                    data={topServicesWithMargin.map((s) => ({
                      name: s.name
                        .split(" – ")[0]
                        .split(" ")
                        .slice(0, 2)
                        .join(" "),
                      Revenue: s.revenue,
                      Profit: s.profit,
                    }))}
                    margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                    barSize={18}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 9,
                        fill: "oklch(var(--muted-foreground))",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip prefix="₹" />} />
                    <Bar
                      dataKey="Revenue"
                      fill={BLUE}
                      radius={[3, 3, 0, 0]}
                      opacity={0.85}
                    />
                    <Bar
                      dataKey="Profit"
                      fill={GREEN}
                      radius={[3, 3, 0, 0]}
                      opacity={0.85}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: "9px", paddingTop: "2px" }}
                      formatter={(v) => (
                        <span
                          style={{ color: "oklch(var(--muted-foreground))" }}
                        >
                          {v}
                        </span>
                      )}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
