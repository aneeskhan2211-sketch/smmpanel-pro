import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminBatchPrices,
  useAdminServices,
  useAdminUpdateServiceVisibility,
} from "@/hooks/useAdmin";
import type { Service } from "@/types";
import {
  ArrowDownUp,
  Pencil,
  RefreshCw,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminService = Service & {
  visible: boolean;
  unitsSold: number;
  revenue: number;
  refillPercent: number;
  deliveryDays: number;
};

type SortField = "price" | "revenue" | "delivery";
type PlatformFilter =
  | "all"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "twitter"
  | "telegram"
  | "website";

// ─── Constants ───────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
  tiktok: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  twitter: "bg-primary/10 text-primary border-primary/20",
  facebook: "bg-blue-600/10 text-blue-400 border-blue-600/20",
  telegram: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  website: "bg-accent/10 text-accent border-accent/20",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  youtube: "▶️",
  tiktok: "🎵",
  twitter: "✖",
  facebook: "📘",
  telegram: "✈️",
  website: "🌐",
};

const BAR_COLORS = ["#3B82F6", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444"];

const MOCK_SERVICES: AdminService[] = [
  {
    id: "s1",
    name: "Instagram Followers – Real",
    category: "instagram",
    pricePerThousand: 0.45,
    minOrder: 100,
    maxOrder: 1000000,
    deliveryTime: "24-48h",
    refill: true,
    rating: 4.8,
    description:
      "High-quality real Instagram followers with slow drop guarantee",
    speed: "medium",
    visible: true,
    unitsSold: 1280000,
    revenue: 42800,
    refillPercent: 30,
    deliveryDays: 2,
  },
  {
    id: "s2",
    name: "YouTube Views – Premium",
    category: "youtube",
    pricePerThousand: 0.4,
    minOrder: 500,
    maxOrder: 5000000,
    deliveryTime: "1-2h",
    refill: false,
    rating: 4.6,
    description: "Real watch-time counted views from worldwide accounts",
    speed: "fast",
    visible: true,
    unitsSold: 960000,
    revenue: 38400,
    refillPercent: 0,
    deliveryDays: 1,
  },
  {
    id: "s3",
    name: "TikTok Likes – Fast",
    category: "tiktok",
    pricePerThousand: 0.28,
    minOrder: 100,
    maxOrder: 500000,
    deliveryTime: "0-1h",
    refill: false,
    rating: 4.9,
    description: "Instant TikTok likes delivered within minutes",
    speed: "fast",
    visible: true,
    unitsSold: 740000,
    revenue: 29600,
    refillPercent: 0,
    deliveryDays: 0,
  },
  {
    id: "s4",
    name: "Twitter Retweets",
    category: "twitter",
    pricePerThousand: 1.2,
    minOrder: 50,
    maxOrder: 10000,
    deliveryTime: "2-6h",
    refill: false,
    rating: 4.4,
    description: "Real account retweets from aged Twitter profiles",
    speed: "medium",
    visible: true,
    unitsSold: 552500,
    revenue: 22100,
    refillPercent: 0,
    deliveryDays: 1,
  },
  {
    id: "s5",
    name: "Facebook Page Likes",
    category: "facebook",
    pricePerThousand: 0.8,
    minOrder: 100,
    maxOrder: 100000,
    deliveryTime: "24h",
    refill: true,
    rating: 4.3,
    description: "Genuine page likes from active Facebook users",
    speed: "slow",
    visible: false,
    unitsSold: 472500,
    revenue: 18900,
    refillPercent: 20,
    deliveryDays: 1,
  },
  {
    id: "s6",
    name: "Telegram Channel Members",
    category: "telegram",
    pricePerThousand: 0.6,
    minOrder: 100,
    maxOrder: 200000,
    deliveryTime: "12-24h",
    refill: true,
    rating: 4.5,
    description: "Real Telegram channel members with profile photos",
    speed: "medium",
    visible: true,
    unitsSold: 310000,
    revenue: 15200,
    refillPercent: 15,
    deliveryDays: 1,
  },
  {
    id: "s7",
    name: "Website Traffic – Organic",
    category: "website",
    pricePerThousand: 2.5,
    minOrder: 1000,
    maxOrder: 1000000,
    deliveryTime: "1-3 days",
    refill: false,
    rating: 4.2,
    description: "Geo-targeted website visitors with realistic bounce rates",
    speed: "slow",
    visible: true,
    unitsSold: 185000,
    revenue: 12800,
    refillPercent: 0,
    deliveryDays: 3,
  },
];

// ─── Edit Service Modal ───────────────────────────────────────────────────────
interface EditServiceModalProps {
  service: AdminService | null;
  onClose: () => void;
}

function EditServiceModal({ service, onClose }: EditServiceModalProps) {
  const updateVisibility = useAdminUpdateServiceVisibility();
  const [form, setForm] = useState<{
    name: string;
    description: string;
    pricePerThousand: string;
    minOrder: string;
    maxOrder: string;
    refillPercent: string;
    deliveryDays: string;
    visible: boolean;
  }>(
    service
      ? {
          name: service.name,
          description: service.description,
          pricePerThousand: service.pricePerThousand.toString(),
          minOrder: service.minOrder.toString(),
          maxOrder: service.maxOrder.toString(),
          refillPercent: service.refillPercent.toString(),
          deliveryDays: service.deliveryDays.toString(),
          visible: service.visible,
        }
      : {
          name: "",
          description: "",
          pricePerThousand: "",
          minOrder: "",
          maxOrder: "",
          refillPercent: "",
          deliveryDays: "",
          visible: true,
        },
  );

  function handleSubmit() {
    if (!service) return;
    if (form.visible !== service.visible) {
      updateVisibility.mutate({ serviceId: service.id, visible: form.visible });
    }
    onClose();
  }

  return (
    <Dialog open={!!service} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="admin.services.edit_service.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Edit Service
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Service Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-background border-border"
              data-ocid="admin.services.edit_name.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="bg-background border-border resize-none"
              data-ocid="admin.services.edit_description.textarea"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Price / 1K (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.pricePerThousand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerThousand: e.target.value }))
                }
                className="bg-background border-border"
                data-ocid="admin.services.edit_price.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Qty</Label>
              <Input
                type="number"
                value={form.minOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrder: e.target.value }))
                }
                className="bg-background border-border"
                data-ocid="admin.services.edit_min.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Qty</Label>
              <Input
                type="number"
                value={form.maxOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxOrder: e.target.value }))
                }
                className="bg-background border-border"
                data-ocid="admin.services.edit_max.input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Refill % (0 = no refill)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.refillPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, refillPercent: e.target.value }))
                }
                className="bg-background border-border"
                data-ocid="admin.services.edit_refill.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery (days)</Label>
              <Input
                type="number"
                min="0"
                value={form.deliveryDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryDays: e.target.value }))
                }
                className="bg-background border-border"
                data-ocid="admin.services.edit_delivery.input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Visible to users</p>
              <p className="text-xs text-muted-foreground">
                Toggle to hide/show this service
              </p>
            </div>
            <Switch
              checked={form.visible}
              onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))}
              data-ocid="admin.services.edit_visible.switch"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="admin.services.edit.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateVisibility.isPending}
            data-ocid="admin.services.edit.save_button"
          >
            {updateVisibility.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Batch Price Modal ────────────────────────────────────────────────────────
interface BatchPriceModalProps {
  services: AdminService[];
  onClose: () => void;
}

function BatchPriceModal({ services, onClose }: BatchPriceModalProps) {
  const batchPrices = useAdminBatchPrices();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pctChange, setPctChange] = useState("");

  const pct = Number.parseFloat(pctChange) || 0;

  function toggleAll() {
    if (selected.size === services.length) setSelected(new Set());
    else setSelected(new Set(services.map((s) => s.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (!selected.size || !pct) return;
    const updates = services
      .filter((s) => selected.has(s.id))
      .map((s) => ({
        serviceId: s.id,
        pricePerThousand: Math.max(0, s.pricePerThousand * (1 + pct / 100)),
      }));
    batchPrices.mutate(updates, { onSuccess: onClose });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-2xl"
        data-ocid="admin.services.batch_price.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Batch Update Prices
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1">
              <Label>Price Change %</Label>
              <Input
                type="number"
                placeholder="e.g. +10 or -5"
                value={pctChange}
                onChange={(e) => setPctChange(e.target.value)}
                className="bg-background border-border"
                data-ocid="admin.services.batch_price.pct_input"
              />
            </div>
            <p className="text-xs text-muted-foreground pb-2">
              {pct > 0
                ? `+${pct}% increase`
                : pct < 0
                  ? `${pct}% decrease`
                  : "No change"}
            </p>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 flex items-center gap-3 border-b border-border">
              <Checkbox
                checked={
                  selected.size === services.length && services.length > 0
                }
                onCheckedChange={toggleAll}
                data-ocid="admin.services.batch_price.select_all.checkbox"
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {selected.size} of {services.length} selected
              </span>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
              {services.map((svc) => {
                const newPrice = Math.max(
                  0,
                  svc.pricePerThousand * (1 + pct / 100),
                );
                return (
                  <div
                    key={svc.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/20 transition-colors"
                  >
                    <Checkbox
                      checked={selected.has(svc.id)}
                      onCheckedChange={() => toggle(svc.id)}
                    />
                    <span className="flex-1 text-sm truncate min-w-0">
                      {svc.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      ₹{svc.pricePerThousand.toFixed(3)}
                    </span>
                    {selected.has(svc.id) && pct !== 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span
                          className={`text-xs font-mono font-semibold ${
                            pct > 0 ? "text-destructive" : "text-accent"
                          }`}
                        >
                          ₹{newPrice.toFixed(3)}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="admin.services.batch_price.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={batchPrices.isPending || !selected.size || !pct}
            data-ocid="admin.services.batch_price.confirm_button"
          >
            {batchPrices.isPending
              ? "Applying…"
              : `Apply to ${selected.size} service${
                  selected.size !== 1 ? "s" : ""
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────
interface RevenueChartProps {
  services: AdminService[];
}

function RevenueChart({ services }: RevenueChartProps) {
  const top5 = [...services]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((s, idx) => ({
      name: s.name.length > 22 ? `${s.name.slice(0, 22)}…` : s.name,
      revenue: s.revenue,
      colorKey: `color-${idx}`,
      fill: BAR_COLORS[idx % BAR_COLORS.length],
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-5"
      data-ocid="admin.services.revenue_chart.card"
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-sm">
          Top 5 Services by Revenue
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={top5}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "oklch(var(--foreground))",
            }}
            formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {top5.map((entry) => (
              <Cell key={entry.colorKey} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminServicesPage() {
  const { data: apiServices, isLoading } = useAdminServices();
  const updateVisibility = useAdminUpdateServiceVisibility();

  const services: AdminService[] =
    apiServices && (apiServices as unknown[]).length > 0
      ? (apiServices as unknown as AdminService[])
      : MOCK_SERVICES;

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [editService, setEditService] = useState<AdminService | null>(null);
  const [showBatch, setShowBatch] = useState(false);

  const filtered = useMemo(() => {
    let result = [...services];
    if (search.trim())
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (platform !== "all")
      result = result.filter((s) => s.category === platform);
    if (activeFilter === "active") result = result.filter((s) => s.visible);
    else if (activeFilter === "inactive")
      result = result.filter((s) => !s.visible);
    return result.sort((a, b) => {
      if (sortField === "price") return a.pricePerThousand - b.pricePerThousand;
      if (sortField === "revenue") return b.revenue - a.revenue;
      return a.deliveryDays - b.deliveryDays;
    });
  }, [services, search, platform, activeFilter, sortField]);

  const PLATFORMS = [
    "instagram",
    "youtube",
    "tiktok",
    "facebook",
    "twitter",
    "telegram",
    "website",
  ] as const;

  return (
    <div className="space-y-6" data-ocid="admin.services.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Services
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {services.length} services across{" "}
            {new Set(services.map((s) => s.category)).size} platforms
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowBatch(true)}
          className="gap-2 shrink-0"
          data-ocid="admin.services.batch_price.open_modal_button"
        >
          <Tag className="h-4 w-4" />
          Batch Update Prices
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
            data-ocid="admin.services.search.input"
          />
        </div>

        <Select
          value={platform}
          onValueChange={(v) => setPlatform(v as PlatformFilter)}
        >
          <SelectTrigger
            className="w-full sm:w-44 bg-card border-border"
            data-ocid="admin.services.platform.select"
          >
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {PLATFORM_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilter}
          onValueChange={(v) =>
            setActiveFilter(v as "all" | "active" | "inactive")
          }
        >
          <SelectTrigger
            className="w-full sm:w-36 bg-card border-border"
            data-ocid="admin.services.status.select"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortField}
          onValueChange={(v) => setSortField(v as SortField)}
        >
          <SelectTrigger
            className="w-full sm:w-44 bg-card border-border"
            data-ocid="admin.services.sort.select"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="revenue">Sort: Revenue</SelectItem>
            <SelectItem value="price">Sort: Price</SelectItem>
            <SelectItem value="delivery">Sort: Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.services.loading_state">
          {["a", "b", "c", "d", "e"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                    Platform
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">
                    Price/1K
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">
                    Min
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">
                    Max
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell whitespace-nowrap">
                    Delivery
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell whitespace-nowrap">
                    Refill%
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell whitespace-nowrap">
                    Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell whitespace-nowrap">
                    Units Sold
                  </th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-medium">
                    Visible
                  </th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="admin.services.empty_state"
                    >
                      No services match your filters
                    </td>
                  </tr>
                )}
                {filtered.map((svc, i) => (
                  <motion.tr
                    key={svc.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.services.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {svc.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {svc.refill && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-accent/30 text-accent shrink-0"
                          >
                            <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                            Refill
                          </Badge>
                        )}
                        <span className="font-medium truncate max-w-[160px]">
                          {svc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${
                          PLATFORM_COLORS[svc.category] ?? ""
                        }`}
                      >
                        <span>{PLATFORM_ICONS[svc.category]}</span>
                        {svc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      ₹{svc.pricePerThousand.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                      {svc.minOrder.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                      {svc.maxOrder.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                      {svc.deliveryTime}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      {svc.refillPercent > 0 ? (
                        <span className="text-accent font-medium">
                          {svc.refillPercent}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium hidden xl:table-cell">
                      ₹{svc.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden xl:table-cell">
                      {svc.unitsSold.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Switch
                          checked={svc.visible}
                          onCheckedChange={(v) =>
                            updateVisibility.mutate({
                              serviceId: svc.id,
                              visible: v,
                            })
                          }
                          data-ocid={`admin.services.visible_switch.${i + 1}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:text-primary"
                          onClick={() => setEditService(svc)}
                          aria-label="Edit service"
                          data-ocid={`admin.services.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Revenue Chart */}
      {!isLoading && services.length > 0 && (
        <RevenueChart services={services} />
      )}

      {/* Modals */}
      {editService && (
        <EditServiceModal
          service={editService}
          onClose={() => setEditService(null)}
        />
      )}
      {showBatch && (
        <BatchPriceModal
          services={services}
          onClose={() => setShowBatch(false)}
        />
      )}
    </div>
  );
}
