import { LevelName } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDailySpend,
  useDashboardStats,
  useOrderActivity,
} from "@/hooks/useDashboard";
import { useEngagement } from "@/hooks/useEngagement";
import { useAuthStore } from "@/store/authStore";
import type { Coupon } from "@/types/index";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  Calculator,
  CheckCircle2,
  Copy,
  Gift,
  Loader2,
  Package2,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ─── Stat card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  delay: number;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  delay,
  isLoading,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="card-hover border-border/50 bg-card">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-28" />
              ) : (
                <p className="mt-1 truncate font-display text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
              )}
            </div>
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTooltipContent({
  active,
  payload,
  label,
}: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-effect rounded-lg px-3 py-2 text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-primary">{payload[0].value}</p>
    </div>
  );
}

// ─── Trust badge ──────────────────────────────────────────────────────────────
function TrustBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
        <CheckCircle2 className="h-3 w-3 text-accent" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  );
}

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<
  string,
  { ring: string; badge: string; glow: string }
> = {
  [LevelName.bronze]: {
    ring: "ring-orange-500/60",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    glow: "bg-orange-500/20",
  },
  [LevelName.silver]: {
    ring: "ring-slate-400/60",
    badge: "bg-slate-400/15 text-slate-300 border-slate-400/30",
    glow: "bg-slate-400/20",
  },
  [LevelName.gold]: {
    ring: "ring-yellow-400/60",
    badge: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
    glow: "bg-yellow-400/20",
  },
  [LevelName.platinum]: {
    ring: "ring-primary/60",
    badge: "bg-primary/15 text-primary border-primary/30",
    glow: "bg-primary/20",
  },
};

// ─── Spin Wheel ───────────────────────────────────────────────────────────────
const WHEEL_SEGMENTS = ["5%", "10%", "15%", "5%", "20%", "10%", "15%", "5%"];
const WHEEL_COLORS = [
  "oklch(0.58 0.19 250)", // blue
  "oklch(0.68 0.2 150)", // green
  "oklch(0.75 0.18 55)", // yellow
  "oklch(0.58 0.19 250)",
  "oklch(0.65 0.22 30)", // orange
  "oklch(0.68 0.2 150)",
  "oklch(0.75 0.18 55)",
  "oklch(0.58 0.19 250)",
];

function SpinWheelCard() {
  const { spinWheel } = useEngagement();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<string | null>(null);
  const spinCount = useRef(0);

  const handleSpin = () => {
    if (spinning || spinWheel.isPending) return;
    setSpinning(true);
    setReward(null);
    const extra = 1440 + Math.floor(Math.random() * 360);
    setRotation((r) => r + extra);
    spinCount.current += 1;
    const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    setTimeout(() => {
      setSpinning(false);
      setReward(WHEEL_SEGMENTS[idx]);
      spinWheel.mutate();
    }, 3000);
  };

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <Card
      className="border-border/50 bg-card"
      data-ocid="engagement.spin_wheel_card"
    >
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/15">
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm">
              Spin &amp; Win
            </h4>
            <p className="text-xs text-muted-foreground">
              Win discount coupons daily
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* SVG Wheel */}
          <div className="relative">
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              className="drop-shadow-lg"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)"
                  : "none",
              }}
              aria-label="Spin wheel"
              role="img"
            >
              {WHEEL_SEGMENTS.map((label, i) => {
                const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
                const endAngle =
                  ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
                const r = 76;
                const cx = 80;
                const cy = 80;
                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const midAngle = (startAngle + endAngle) / 2;
                const tx = cx + r * 0.6 * Math.cos(midAngle);
                const ty = cy + r * 0.6 * Math.sin(midAngle);
                return (
                  <g key={label + String(i)}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                      stroke="oklch(0.15 0.01 264)"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill="#fff"
                      transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${tx}, ${ty})`}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              {/* Center hub */}
              <circle
                cx="80"
                cy="80"
                r="12"
                fill="oklch(0.15 0.01 264)"
                stroke="oklch(0.3 0.01 264)"
                strokeWidth="2"
              />
              <circle cx="80" cy="80" r="4" fill="oklch(0.58 0.19 250)" />
            </svg>
            {/* Pointer */}
            <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="h-4 w-3 border-x-[6px] border-b-[14px] border-x-transparent border-b-yellow-400" />
            </div>
          </div>

          {reward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg bg-accent/15 border border-accent/30 px-4 py-2 text-center"
            >
              <p className="text-xs text-muted-foreground">You won</p>
              <p className="font-display text-2xl font-bold text-accent">
                {reward} OFF
              </p>
              <p className="text-xs text-muted-foreground">
                coupon added to your account
              </p>
            </motion.div>
          )}

          <Button
            data-ocid="engagement.spin_wheel_button"
            onClick={handleSpin}
            disabled={spinning || spinWheel.isPending}
            className="w-full bg-yellow-400/90 text-[#0B0F19] font-bold hover:bg-yellow-400 transition-smooth"
          >
            {spinning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Spinning...
              </>
            ) : (
              "🎡 Spin Now"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Coupon card ──────────────────────────────────────────────────────────────
function CouponCard({ coupon, index }: { coupon: Coupon; index: number }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  const expiry = new Date(Number(coupon.expiryDate) / 1_000_000);
  return (
    <div
      data-ocid={`engagement.coupon.item.${index + 1}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
    >
      <div className="min-w-0">
        <code className="font-mono text-sm font-bold text-primary tracking-widest">
          {coupon.code}
        </code>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className="text-[10px] px-1.5 py-0 bg-accent/15 text-accent border-accent/30">
            {coupon.discountPercentage}% OFF
          </Badge>
          <span className="text-xs text-muted-foreground">
            Expires {expiry.toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleCopy}
        className="shrink-0 min-w-[44px] h-[44px]"
        data-ocid={`engagement.copy_coupon_button.${index + 1}`}
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: dailySpend, isLoading: spendLoading } = useDailySpend();
  const { data: orderActivity, isLoading: activityLoading } =
    useOrderActivity();
  const {
    level,
    referrals,
    coupons,
    claimedToday,
    claimDailyReward,
    isLoading: engLoading,
  } = useEngagement();

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const walletDisplay = stats
    ? `$${stats.walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  const levelData = level?.levelName
    ? (LEVEL_STYLES[level.levelName] ?? LEVEL_STYLES[LevelName.bronze])
    : LEVEL_STYLES[LevelName.bronze];

  const totalReferralEarnings = referrals.reduce(
    (sum, r) => sum + Number(r.earnings),
    0,
  );
  const referralCode = user?.username
    ? `SMM-${user.username.toUpperCase().slice(0, 6)}`
    : "SMM-REF";
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/ref/${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Level progress
  const minSpend = Number(level?.minSpend ?? BigInt(0));
  const maxSpend = Number(level?.maxSpend ?? BigInt(5000));
  const currentSpend = minSpend + Math.floor((maxSpend - minSpend) * 0.48); // from stats in real app
  const progressPct = Math.min(
    100,
    Math.round(((currentSpend - minSpend) / (maxSpend - minSpend)) * 100),
  );

  const hasOrders = stats ? stats.totalOrders > 0 : false;

  return (
    <div data-ocid="dashboard.page" className="space-y-6 p-1">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1"
      >
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back,{" "}
          <span className="font-medium text-foreground">
            {user?.username ?? "user"}
          </span>
          . Here&apos;s your overview.
        </p>
      </motion.div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet Balance"
          value={walletDisplay}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/15"
          delay={0.05}
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats ? stats.totalOrders.toLocaleString() : "0"}
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/15"
          delay={0.1}
          isLoading={statsLoading}
        />
        <StatCard
          label="Active Orders"
          value={stats ? String(stats.activeOrders) : "0"}
          icon={<RefreshCw className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/15"
          delay={0.15}
          isLoading={statsLoading}
        />
        <StatCard
          label="Completed Orders"
          value={stats ? String(stats.completedOrders) : "0"}
          icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
          iconBg="bg-accent/15"
          delay={0.2}
          isLoading={statsLoading}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Daily Spending
                  </h3>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
              {spendLoading ? (
                <div className="flex h-48 items-end gap-2 px-2">
                  {["m", "t", "w", "th", "f", "sa", "su"].map((day) => (
                    <Skeleton
                      key={day}
                      className="flex-1 animate-pulse rounded-sm"
                      style={{ height: "60%" }}
                    />
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={192}>
                  <BarChart data={dailySpend} barCategoryGap="30%">
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "oklch(0.55 0.005 264)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.55 0.005 264)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={false} />
                    <Bar
                      dataKey="value"
                      fill="oklch(0.58 0.19 250)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Order Activity
                  </h3>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                  <Activity className="h-4 w-4 text-accent" />
                </div>
              </div>
              {activityLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={192}>
                  <LineChart data={orderActivity}>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "oklch(0.55 0.005 264)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.55 0.005 264)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={false} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.68 0.2 150)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "oklch(0.68 0.2 150)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="space-y-3"
        data-ocid="dashboard.quick_actions_section"
      >
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button
            data-ocid="dashboard.order_now_button"
            size="lg"
            className="glow-primary h-14 w-full bg-primary font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 hover:scale-[1.01]"
            onClick={() => navigate({ to: "/new-order" })}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Order Now
          </Button>
          <Button
            data-ocid="dashboard.view_bundles_button"
            size="lg"
            variant="outline"
            className="h-14 w-full border-border font-semibold transition-smooth hover:border-primary/50 hover:bg-primary/10"
            onClick={() => navigate({ to: "/bundles" })}
          >
            <Package2 className="mr-2 h-5 w-5" />
            Bundles
          </Button>
          <Button
            data-ocid="dashboard.calculator_button"
            size="lg"
            variant="outline"
            className="h-14 w-full border-border font-semibold transition-smooth hover:border-primary/50 hover:bg-primary/10"
            onClick={() => navigate({ to: "/calculator" })}
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calculator
          </Button>
          <Button
            data-ocid="dashboard.ai_tools_button"
            size="lg"
            variant="outline"
            className="h-14 w-full border-border font-semibold transition-smooth hover:border-accent/50 hover:bg-accent/10"
            onClick={() => navigate({ to: "/ai-tools" })}
          >
            <Bot className="mr-2 h-5 w-5 text-accent" />
            AI Tools
          </Button>
        </div>
      </motion.div>

      {/* ── Engagement Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="space-y-4"
        data-ocid="dashboard.engagement_section"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">
            Your Rewards &amp; Perks
          </h2>
        </div>

        {/* First Order Banner */}
        {!hasOrders && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-5"
            data-ocid="engagement.first_order_banner"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    First Order Discount
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your first order gets{" "}
                    <span className="font-bold text-primary">10% off</span> —
                    use code{" "}
                    <code className="font-mono font-bold tracking-widest text-primary">
                      FIRST10
                    </code>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => navigate({ to: "/new-order" })}
                data-ocid="engagement.first_order_cta_button"
              >
                Order Now
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* ── Daily Login Reward ── */}
          <Card
            className="border-border/50 bg-card"
            data-ocid="engagement.daily_reward_card"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                  <Gift className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm">
                    Daily Login Reward
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    ₹10 credited per day
                  </p>
                </div>
              </div>
              {engLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : claimedToday ? (
                <div className="flex flex-col items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                  <p className="font-semibold text-accent text-sm">
                    Claimed today!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Come back tomorrow for another ₹10
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-accent/5 border border-accent/20 p-3 w-full text-center">
                    <span className="font-display text-2xl font-bold text-accent">
                      ₹10
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Available now
                    </span>
                  </div>
                  <Button
                    data-ocid="engagement.claim_reward_button"
                    className="w-full animate-pulse-glow bg-accent text-[#0B0F19] font-bold hover:bg-accent/90"
                    onClick={() => claimDailyReward.mutate()}
                    disabled={claimDailyReward.isPending}
                  >
                    {claimDailyReward.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Claim ₹10 Reward
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── User Level Progress ── */}
          <Card
            className="border-border/50 bg-card"
            data-ocid="engagement.level_card"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm">
                    Your Level
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Unlock perks as you grow
                  </p>
                </div>
              </div>
              {engLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : level ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-2 ${levelData.ring} ${levelData.glow}`}
                    >
                      <Star
                        className="h-5 w-5"
                        style={{ color: "currentColor" }}
                      />
                    </div>
                    <div>
                      <Badge
                        className={`capitalize text-xs font-bold border ${levelData.badge}`}
                      >
                        {level.displayName ?? level.levelName.toString()}
                      </Badge>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ₹{currentSpend.toLocaleString()} / ₹
                        {maxSpend.toLocaleString()} to next level
                      </p>
                    </div>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <div className="space-y-1">
                    {(level.perks ?? []).slice(0, 3).map((perk: string) => (
                      <div key={perk} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {perk}
                        </span>
                      </div>
                    ))}
                    {level.cashbackPercent > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {level.cashbackPercent}% cashback on orders
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-2 ring-orange-500/60 bg-orange-500/20">
                      <Star className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <Badge className="capitalize text-xs font-bold border bg-orange-500/15 text-orange-400 border-orange-500/30">
                        Bronze
                      </Badge>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ₹0 / ₹5,000 to Silver
                      </p>
                    </div>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="space-y-1">
                    {[
                      "Standard support",
                      "Basic order queue",
                      "5% referral commission",
                    ].map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Referral Program ── */}
          <Card
            className="border-border/50 bg-card"
            data-ocid="engagement.referral_card"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm">
                    Referral Program
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Earn 5% on every referred order
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your Code
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 min-w-0 truncate rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm font-bold tracking-widest text-foreground"
                      data-ocid="engagement.referral_code"
                    >
                      {referralCode}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyReferral}
                      className="h-[44px] w-[44px] shrink-0 p-0"
                      data-ocid="engagement.copy_referral_button"
                    >
                      {copiedReferral ? (
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Referral Link
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 min-w-0 truncate rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {referralLink}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="h-[44px] w-[44px] shrink-0 p-0"
                      data-ocid="engagement.copy_referral_link_button"
                    >
                      {copiedLink ? (
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-muted/50 border border-border/40 p-3 text-center">
                    <p className="font-display text-xl font-bold text-foreground">
                      {referrals.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Referred Users
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 border border-border/40 p-3 text-center">
                    <p className="font-display text-xl font-bold text-accent">
                      ₹{totalReferralEarnings.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Earned
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Spin Wheel ── */}
          <SpinWheelCard />

          {/* ── Available Coupons ── */}
          <Card
            className="border-border/50 bg-card"
            data-ocid="engagement.coupons_card"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                    <Ticket className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm">
                      Available Coupons
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Use at checkout for discounts
                    </p>
                  </div>
                </div>
                {coupons.length > 0 && (
                  <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">
                    {coupons.length} active
                  </Badge>
                )}
              </div>
              {engLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : coupons.length > 0 ? (
                <div
                  className="space-y-2 max-h-52 overflow-y-auto pr-1"
                  data-ocid="engagement.coupons_list"
                >
                  {coupons.slice(0, 5).map((coupon, i) => (
                    <CouponCard
                      key={String(coupon.id)}
                      coupon={coupon as unknown as Coupon}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/50 py-8 text-center"
                  data-ocid="engagement.coupons_empty_state"
                >
                  <Ticket className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No active coupons
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Spin the wheel to earn one!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ── Trust footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <Card className="border-border/30 bg-muted/30">
          <CardContent className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  10,000+ orders delivered
                </span>
              </div>
              <TrustBadge text="99.3% success rate" />
              <TrustBadge text="Instant refunds on failure" />
              <div className="ml-auto flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="gap-1 border border-primary/20 bg-primary/10 text-primary"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Secure Payments
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 border border-accent/20 bg-accent/10 text-accent"
                >
                  <Star className="h-3 w-3" />
                  Trusted Platform
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
