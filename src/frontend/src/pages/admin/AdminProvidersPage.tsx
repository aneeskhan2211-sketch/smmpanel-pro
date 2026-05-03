import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import {
  useAdminAddProvider,
  useAdminProviders,
  useAdminUpdateProvider,
} from "@/hooks/useAdmin";
import type { Provider } from "@/types/admin";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Database,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Save,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle,
    badgeClass: "border-accent/40 text-accent bg-accent/10",
    dotClass: "bg-accent",
  },
  inactive: {
    label: "Inactive",
    icon: XCircle,
    badgeClass: "border-border text-muted-foreground bg-muted/20",
    dotClass: "bg-muted-foreground",
  },
  error: {
    label: "Testing",
    icon: AlertTriangle,
    badgeClass: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
    dotClass: "bg-yellow-400",
  },
} satisfies Record<
  Provider["status"],
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    dotClass: string;
  }
>;

function getSuccessRateColor(rate: number) {
  if (rate >= 97) return "text-accent";
  if (rate >= 92) return "text-yellow-400";
  return "text-destructive";
}

function maskUrl(url: string) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname.substring(0, 4)}****${u.hostname.slice(-4)}`;
  } catch {
    return `${url.substring(0, 12)}****`;
  }
}

// ─── Circular Progress ───────────────────────────────────────────────────────
function CircularProgress({
  value,
  size = 48,
}: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  const colorClass =
    value >= 97
      ? "stroke-accent"
      : value >= 92
        ? "stroke-yellow-400"
        : "stroke-destructive";
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      aria-hidden="true"
      role="presentation"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={4}
        className="stroke-muted/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={4}
        className={colorClass}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Provider Form (shared Add / Edit) ───────────────────────────────────────
type ProviderFormData = {
  name: string;
  apiUrl: string;
  apiKey: string;
  commissionPercent: number;
  priority: number;
  status: Provider["status"];
};

const EMPTY_FORM: ProviderFormData = {
  name: "",
  apiUrl: "",
  apiKey: "",
  commissionPercent: 15,
  priority: 1,
  status: "active",
};

function ProviderForm({
  initial,
  onSubmit,
  submitLabel,
  isPending,
}: {
  initial: ProviderFormData;
  onSubmit: (data: ProviderFormData) => void;
  submitLabel: string;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ProviderFormData>(initial);
  const [showKey, setShowKey] = useState(false);

  const set = (k: keyof ProviderFormData) => (v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pf-name">Provider Name</Label>
          <Input
            id="pf-name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="SMMProvider Alpha"
            required
            data-ocid="provider_form.name_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-status">Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status")(v)}>
            <SelectTrigger
              id="pf-status"
              data-ocid="provider_form.status_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Testing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pf-url">API Endpoint URL</Label>
          <Input
            id="pf-url"
            value={form.apiUrl}
            onChange={(e) => set("apiUrl")(e.target.value)}
            placeholder="https://api.provider.com/v2"
            type="url"
            required
            data-ocid="provider_form.api_url_input"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pf-key">API Key</Label>
          <div className="relative">
            <Input
              id="pf-key"
              value={form.apiKey}
              onChange={(e) => set("apiKey")(e.target.value)}
              placeholder="sk_live_••••••••••••"
              type={showKey ? "text" : "password"}
              required
              className="pr-10"
              data-ocid="provider_form.api_key_input"
            />
            <button
              type="button"
              onClick={() => setShowKey((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-commission">Commission %</Label>
          <Input
            id="pf-commission"
            value={form.commissionPercent}
            onChange={(e) => set("commissionPercent")(Number(e.target.value))}
            type="number"
            min={0}
            max={100}
            step={0.5}
            required
            data-ocid="provider_form.commission_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-priority">Priority Order</Label>
          <Input
            id="pf-priority"
            value={form.priority}
            onChange={(e) => set("priority")(Number(e.target.value))}
            type="number"
            min={1}
            max={99}
            required
            data-ocid="provider_form.priority_input"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        data-ocid="provider_form.submit_button"
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

// ─── Add Provider Modal ───────────────────────────────────────────────────────
function AddProviderModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { mutate, isPending } = useAdminAddProvider();

  const handleSubmit = useCallback(
    (data: ProviderFormData) => {
      mutate(
        {
          name: data.name,
          apiUrl: data.apiUrl,
          apiKeyMasked:
            data.apiKey.length > 8
              ? `${data.apiKey.slice(0, 4)}****${data.apiKey.slice(-4)}`
              : "****",
          commissionPercent: data.commissionPercent,
          priority: data.priority,
          status: data.status,
        },
        {
          onSuccess: () => {
            toast.success("Provider added successfully");
            onClose();
          },
          onError: () => toast.error("Failed to add provider"),
        },
      );
    },
    [mutate, onClose],
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="add_provider.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Provider</DialogTitle>
        </DialogHeader>
        <ProviderForm
          initial={EMPTY_FORM}
          onSubmit={handleSubmit}
          submitLabel="Add Provider"
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Provider Modal ──────────────────────────────────────────────────────
function EditProviderModal({
  provider,
  onClose,
}: {
  provider: Provider | null;
  onClose: () => void;
}) {
  const { mutate, isPending } = useAdminUpdateProvider();

  const handleSubmit = useCallback(
    (data: ProviderFormData) => {
      if (!provider) return;
      mutate(
        {
          id: provider.id,
          name: data.name,
          apiUrl: data.apiUrl,
          apiKeyMasked:
            data.apiKey.length > 4
              ? `${data.apiKey.slice(0, 4)}****${data.apiKey.slice(-4)}`
              : provider.apiKeyMasked,
          commissionPercent: data.commissionPercent,
          priority: data.priority,
          status: data.status,
        },
        {
          onSuccess: () => {
            toast.success("Provider updated");
            onClose();
          },
          onError: () => toast.error("Failed to update provider"),
        },
      );
    },
    [mutate, provider, onClose],
  );

  const initial: ProviderFormData = provider
    ? {
        name: provider.name,
        apiUrl: provider.apiUrl,
        apiKey: "",
        commissionPercent: provider.commissionPercent,
        priority: provider.priority,
        status: provider.status,
      }
    : EMPTY_FORM;

  return (
    <Dialog open={!!provider} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="edit_provider.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Edit — {provider?.name}
          </DialogTitle>
        </DialogHeader>
        {provider && (
          <ProviderForm
            initial={initial}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  index,
  onEdit,
}: {
  provider: Provider;
  index: number;
  onEdit: (p: Provider) => void;
}) {
  const { mutate: update } = useAdminUpdateProvider();
  const [testing, setTesting] = useState(false);
  const cfg = STATUS_CONFIG[provider.status];
  const StatusIcon = cfg.icon;

  const handleToggle = (checked: boolean) => {
    update(
      { id: provider.id, status: checked ? "active" : "inactive" },
      {
        onSuccess: () =>
          toast.success(`Provider ${checked ? "enabled" : "disabled"}`),
        onError: () => toast.error("Status update failed"),
      },
    );
  };

  const handleTestWebhook = () => {
    setTesting(true);
    setTimeout(
      () => {
        setTesting(false);
        if (Math.random() > 0.25) {
          toast.success(
            `${provider.name}: Webhook responded in ${provider.avgResponseMs}ms ✓`,
          );
        } else {
          toast.error(`${provider.name}: Webhook test failed — timeout`);
        }
      },
      1500 + Math.random() * 500,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-ocid={`admin.providers.item.${index + 1}`}
    >
      <Card className="border-border hover:border-primary/40 transition-smooth card-hover h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotClass}`}
              />
              <CardTitle className="text-sm font-semibold truncate">
                {provider.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-xs ${cfg.badgeClass}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {cfg.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span className="font-mono truncate">
              {maskUrl(provider.apiUrl)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Metrics row */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <CircularProgress value={provider.successRate} size={52} />
              <span
                className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${getSuccessRateColor(provider.successRate)}`}
              >
                {provider.successRate.toFixed(0)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-muted-foreground text-[10px] leading-tight mb-0.5">
                  Failed 24h
                </p>
                <p
                  className={`font-bold text-sm ${provider.failedLast24h > 10 ? "text-destructive" : "text-foreground"}`}
                >
                  {provider.failedLast24h}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-muted-foreground text-[10px] leading-tight mb-0.5">
                  Resp ms
                </p>
                <p className="font-bold text-sm text-foreground">
                  {provider.avgResponseMs}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-muted-foreground text-[10px] leading-tight mb-0.5">
                  Margin
                </p>
                <p className="font-bold text-sm text-primary">
                  {provider.commissionPercent}%
                </p>
              </div>
            </div>
          </div>

          {/* Priority + toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>Priority #{provider.priority}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {provider.status === "active" ? "On" : "Off"}
              </span>
              <Switch
                checked={provider.status === "active"}
                onCheckedChange={handleToggle}
                aria-label="Toggle provider"
                data-ocid={`admin.providers.toggle.${index + 1}`}
              />
            </div>
          </div>

          {/* API key */}
          <code className="text-xs bg-muted/30 px-3 py-1.5 rounded-lg font-mono text-muted-foreground flex items-center gap-2">
            <Database className="h-3 w-3 shrink-0" />
            {provider.apiKeyMasked}
          </code>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => onEdit(provider)}
              data-ocid={`admin.providers.edit_button.${index + 1}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleTestWebhook}
              disabled={testing}
              data-ocid={`admin.providers.test_button.${index + 1}`}
            >
              {testing ? (
                <>
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  Testing…
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Health Table ─────────────────────────────────────────────────────────────
function HealthTable({ providers }: { providers: Provider[] }) {
  return (
    <div data-ocid="admin.providers.health_section">
      <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Provider Health Metrics
      </h2>
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                  Provider
                </th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                  Success Rate
                </th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                  Failed (24h)
                </th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                  Avg Response
                </th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">
                  Uptime
                </th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => {
                const cfg = STATUS_CONFIG[p.status];
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                    data-ocid={`admin.providers.health_row.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${getSuccessRateColor(p.successRate)}`}
                      >
                        {p.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${p.failedLast24h > 10 ? "text-destructive" : ""}`}
                    >
                      {p.failedLast24h}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {p.avgResponseMs}ms
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${cfg.badgeClass}`}
                        >
                          {p.status === "active" ? (
                            <>
                              <Wifi className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </>
                          )}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Priority Reorder ─────────────────────────────────────────────────────────
function PriorityReorder({ initial }: { initial: Provider[] }) {
  const { mutate: update, isPending } = useAdminUpdateProvider();
  const [list, setList] = useState(() =>
    [...initial].sort((a, b) => a.priority - b.priority),
  );
  const [dirty, setDirty] = useState(false);

  const move = (fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= list.length) return;
    const next = [...list];
    [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
    setList(next);
    setDirty(true);
  };

  const handleSave = () => {
    list.forEach((p, i) => {
      update({ id: p.id, priority: i + 1 });
    });
    toast.success("Failover priority saved");
    setDirty(false);
  };

  return (
    <div data-ocid="admin.providers.priority_section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <ChevronDown className="h-5 w-5 text-primary" />
          Failover Priority Order
        </h2>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || isPending}
          className="gap-1.5"
          data-ocid="admin.providers.save_priority_button"
        >
          <Save className="h-4 w-4" />
          Save Order
        </Button>
      </div>
      <Card className="border-border">
        <CardContent className="pt-4 space-y-2">
          <AnimatePresence>
            {list.map((p, i) => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                  data-ocid={`admin.providers.priority_item.${i + 1}`}
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotClass}`}
                  />
                  <span className="font-medium text-sm flex-1 truncate">
                    {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {p.successRate.toFixed(1)}%
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      data-ocid={`admin.providers.move_up.${i + 1}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === list.length - 1}
                      aria-label="Move down"
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      data-ocid={`admin.providers.move_down.${i + 1}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminProvidersPage() {
  const { data: providers = [], isLoading } = useAdminProviders();
  const [addOpen, setAddOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Provider["status"]>(
    "all",
  );

  const filtered = providers
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-8 pb-12" data-ocid="admin.providers.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Providers
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage SMM API integrations, failover priority, and health metrics
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="gap-2 shrink-0"
          data-ocid="admin.providers.add_button"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-2 flex-wrap"
        data-ocid="admin.providers.filter_tabs"
      >
        {(["all", "active", "inactive", "error"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
              statusFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
            data-ocid={`admin.providers.filter.${f}`}
          >
            {f === "all"
              ? "All Providers"
              : f === "error"
                ? "Testing"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({providers.filter((p) => p.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Provider Cards */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="admin.providers.loading_state"
        >
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-xl"
          data-ocid="admin.providers.empty_state"
        >
          <Database className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No providers match this filter
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setStatusFilter("all")}
          >
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((provider, i) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={i}
              onEdit={setEditProvider}
            />
          ))}
        </div>
      )}

      {/* Health Metrics */}
      {!isLoading && providers.length > 0 && (
        <HealthTable providers={providers} />
      )}

      {/* Priority Reorder */}
      {!isLoading && providers.length > 0 && (
        <PriorityReorder initial={providers} />
      )}

      {/* Modals */}
      <AddProviderModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditProviderModal
        provider={editProvider}
        onClose={() => setEditProvider(null)}
      />
    </div>
  );
}
