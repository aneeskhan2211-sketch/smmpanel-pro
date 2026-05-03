import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminCancelOrder,
  useAdminOrders,
  useAdminUpdateOrder,
} from "@/hooks/useAdmin";
import type { OrderStatus } from "@/types";
import type { AdminOrder, AdminOrderFilters } from "@/types/admin";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Pencil,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;
const STATUSES = [
  "all",
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "cancelled",
  "partial",
] as const;
type StatusFilter = (typeof STATUSES)[number];
type SortField = "date" | "price";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  processing: "bg-primary/15 text-primary border-primary/30",
  active: "bg-accent/15 text-accent border-accent/30",
  completed: "bg-accent/15 text-accent border-accent/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  partial: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  refunded: "bg-muted text-muted-foreground border-border",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  processing: <ArrowUpDown className="h-3 w-3" />,
  active: <CheckCircle2 className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
  partial: <AlertTriangle className="h-3 w-3" />,
  refunded: <ArrowDown className="h-3 w-3" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "text-pink-400",
  youtube: "text-red-400",
  tiktok: "text-cyan-400",
  twitter: "text-sky-400",
  facebook: "text-blue-400",
  telegram: "text-blue-300",
  website: "text-green-400",
};

function detectPlatform(link: string): string {
  if (link.includes("instagram")) return "instagram";
  if (link.includes("youtube") || link.includes("youtu.be")) return "youtube";
  if (link.includes("tiktok")) return "tiktok";
  if (link.includes("twitter") || link.includes("x.com")) return "twitter";
  if (link.includes("facebook")) return "facebook";
  if (link.includes("t.me") || link.includes("telegram")) return "telegram";
  return "website";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {STATUS_ICONS[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── TruncatedLink ────────────────────────────────────────────────────────────
function TruncatedLink({ href }: { href: string }) {
  const platform = detectPlatform(href);
  return (
    <div className="flex items-center gap-1.5 max-w-[180px]" title={href}>
      <span
        className={`text-xs truncate ${PLATFORM_COLORS[platform] ?? "text-muted-foreground"}`}
      >
        {href.replace(/^https?:\/\/(www\.)?/, "")}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Open link"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ─── SortButton ───────────────────────────────────────────────────────────────
function SortButton({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-left text-muted-foreground font-medium hover:text-foreground transition-colors"
      data-ocid={`admin.orders.sort_${field}_button`}
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUp className="h-3 w-3 text-primary" />
        ) : (
          <ArrowDown className="h-3 w-3 text-primary" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

// ─── EditOrderModal ───────────────────────────────────────────────────────────
function EditOrderModal({
  order,
  open,
  onClose,
}: {
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateOrder = useAdminUpdateOrder();
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const handleOpen = useCallback(() => {
    if (order) {
      setStatus(order.status);
      setPrice(String(order.charge));
      setQty(String(order.quantity));
      setNote(order.adminNote ?? "");
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    await updateOrder.mutateAsync({
      orderId: order.id,
      status,
      note,
    });
    toast.success("Order updated successfully");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        else onClose();
      }}
    >
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="admin.orders.edit.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            Edit Order{" "}
            <span className="text-primary font-mono text-sm">{order?.id}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-status"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Status Override
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                id="edit-status"
                className="bg-background border-border"
                data-ocid="admin.orders.edit.status_select"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(
                  [
                    "pending",
                    "processing",
                    "active",
                    "completed",
                    "cancelled",
                    "partial",
                    "refunded",
                  ] as OrderStatus[]
                ).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-price"
                className="text-muted-foreground text-xs uppercase tracking-wide"
              >
                Price Adjustment (₹)
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background border-border"
                data-ocid="admin.orders.edit.price_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-qty"
                className="text-muted-foreground text-xs uppercase tracking-wide"
              >
                Quantity
              </Label>
              <Input
                id="edit-qty"
                type="number"
                min="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="bg-background border-border"
                data-ocid="admin.orders.edit.qty_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-note"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Admin Note
            </Label>
            <Textarea
              id="edit-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note visible only to admins…"
              className="bg-background border-border resize-none"
              data-ocid="admin.orders.edit.note_textarea"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              data-ocid="admin.orders.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateOrder.isPending}
              className="bg-primary text-primary-foreground"
              data-ocid="admin.orders.edit.submit_button"
            >
              {updateOrder.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CancelOrderModal ─────────────────────────────────────────────────────────
function CancelOrderModal({
  order,
  open,
  onClose,
}: {
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  const cancelOrder = useAdminCancelOrder();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    await cancelOrder.mutateAsync(order.id);
    toast.success(`Order ${order.id} cancelled. Refund will be issued.`);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="admin.orders.cancel.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Cancel Order{" "}
            <span className="text-primary font-mono text-sm">{order?.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-2">
          A full refund of <strong>₹{order?.charge.toFixed(2)}</strong> will be
          issued to the user's wallet automatically.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="cancel-reason"
              className="text-muted-foreground text-xs uppercase tracking-wide"
            >
              Cancellation Reason
            </Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this order is being cancelled…"
              className="bg-background border-border resize-none"
              required
              data-ocid="admin.orders.cancel.reason_textarea"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              data-ocid="admin.orders.cancel.cancel_button"
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={cancelOrder.isPending || !reason.trim()}
              data-ocid="admin.orders.cancel.confirm_button"
            >
              {cancelOrder.isPending ? "Cancelling…" : "Confirm Cancel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── OrderDetailModal ─────────────────────────────────────────────────────────
function OrderDetailModal({
  order,
  open,
  onClose,
}: {
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!order) return null;
  const platform = detectPlatform(order.link);
  const progress =
    order.quantity > 0
      ? Math.round(((order.quantity - order.remains) / order.quantity) * 100)
      : 100;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="admin.orders.detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            Order Details
            <span className="text-primary font-mono text-sm">{order.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* User & Service */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                User
              </p>
              <p className="text-sm font-medium font-mono text-foreground">
                {order.userId}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Service
              </p>
              <p className="text-sm font-medium text-foreground truncate">
                {order.serviceName}
              </p>
            </div>
          </div>

          {/* Link */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Target Link
            </p>
            <a
              href={order.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm break-all hover:underline ${PLATFORM_COLORS[platform] ?? "text-primary"}`}
            >
              {order.link}
            </a>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Price Breakdown
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold font-display text-foreground">
                  {order.quantity.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Ordered</p>
              </div>
              <div>
                <p className="text-lg font-bold font-display text-accent">
                  ₹{order.charge.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Charged</p>
              </div>
              <div>
                <p className="text-lg font-bold font-display text-primary">
                  {progress}%
                </p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
            {order.remains > 0 && (
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Status Timeline
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="text-foreground">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge status={order.status} />
                <span className="text-muted-foreground">Current status</span>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          {order.adminNote && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
              <p className="text-xs text-primary uppercase tracking-wide">
                Admin Note
              </p>
              <p className="text-sm text-foreground">{order.adminNote}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              data-ocid="admin.orders.detail.close_button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── BulkCancelModal ──────────────────────────────────────────────────────────
function BulkCancelModal({
  count,
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  count: number;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="admin.orders.bulk_cancel.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Bulk Cancel {count} Orders
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mt-2">
          Refunds will be issued automatically to all affected users.
        </div>
        <div className="space-y-1.5 mt-2">
          <Label
            htmlFor="bulk-reason"
            className="text-muted-foreground text-xs uppercase tracking-wide"
          >
            Cancellation Reason
          </Label>
          <Textarea
            id="bulk-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for bulk cancellation…"
            className="bg-background border-border resize-none"
            required
            data-ocid="admin.orders.bulk_cancel.reason_textarea"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            data-ocid="admin.orders.bulk_cancel.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !reason.trim()}
            onClick={() => onConfirm(reason)}
            data-ocid="admin.orders.bulk_cancel.confirm_button"
          >
            {isPending ? "Cancelling…" : `Cancel ${count} Orders`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminOrdersPage() {
  const [filters, setFilters] = useState<AdminOrderFilters>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);
  const [cancelOrder, setCancelOrder] = useState<AdminOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);

  const { data: orders, isLoading } = useAdminOrders(filters);
  const cancelMutation = useAdminCancelOrder();

  const filtered = useMemo(() => {
    let list = orders ?? [];
    if (statusFilter !== "all")
      list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.userId.toLowerCase().includes(q) ||
          o.serviceName.toLowerCase().includes(q),
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((o) => o.createdAt >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      list = list.filter((o) => o.createdAt <= to);
    }
    list = [...list].sort((a, b) => {
      const factor = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return factor * (a.createdAt - b.createdAt);
      return factor * (a.charge - b.charge);
    });
    return list;
  }, [orders, statusFilter, search, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((o) => o.id)));
  };

  const handleBulkCancel = async (reason: string) => {
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => cancelMutation.mutateAsync(id)));
    toast.success(`${ids.length} orders cancelled. Refunds issued.`);
    setSelected(new Set());
    setBulkCancelOpen(false);
    void reason;
  };

  const handleStatusFilter = (v: string) => {
    setStatusFilter(v as StatusFilter);
    setFilters((f) => ({ ...f, status: v === "all" ? undefined : v }));
    setPage(1);
    setSelected(new Set());
  };

  const allSelectedOnPage =
    paginated.length > 0 && selected.size === paginated.length;

  return (
    <>
      <div className="space-y-6" data-ocid="admin.orders.page">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Orders
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {filtered.length.toLocaleString()} orders total
              {selected.size > 0 && (
                <span className="ml-2 text-primary font-medium">
                  · {selected.size} selected
                </span>
              )}
            </p>
          </div>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setBulkCancelOpen(true)}
                  data-ocid="admin.orders.bulk_cancel_button"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancel {selected.size} Orders
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or user…"
                className="pl-9 bg-background border-border"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                data-ocid="admin.orders.search_input"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger
                className="w-40 bg-background border-border"
                data-ocid="admin.orders.status_select"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s === "all"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="bg-background border-border text-sm h-9"
                data-ocid="admin.orders.date_from_input"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="bg-background border-border text-sm h-9"
                data-ocid="admin.orders.date_to_input"
              />
            </div>
            {(dateFrom || dateTo || search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setSearch("");
                  setStatusFilter("all");
                  setFilters({});
                  setPage(1);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                data-ocid="admin.orders.clear_filters_button"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2" data-ocid="admin.orders.loading_state">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 w-10">
                      <Checkbox
                        checked={allSelectedOnPage}
                        onCheckedChange={toggleSelectAll}
                        data-ocid="admin.orders.select_all_checkbox"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Order ID
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Service
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                      Link
                    </th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                      Qty
                    </th>
                    <th className="text-right px-4 py-3">
                      <SortButton
                        field="price"
                        label="Price"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Status
                    </th>
                    <th className="text-left px-4 py-3">
                      <SortButton
                        field="date"
                        label="Date"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.2 }}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${
                        selected.has(order.id)
                          ? "bg-primary/5"
                          : "hover:bg-muted/20"
                      }`}
                      onClick={() => setDetailOrder(order)}
                      data-ocid={`admin.orders.item.${i + 1}`}
                    >
                      <td
                        className="px-4 py-3 w-10"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.has(order.id)}
                          onCheckedChange={() => toggleSelect(order.id)}
                          data-ocid={`admin.orders.checkbox.${i + 1}`}
                          aria-label={`Select order ${order.id}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">
                          {order.userId}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[140px]">
                        <span className="block truncate text-sm">
                          {order.serviceName}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 hidden md:table-cell"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <TruncatedLink href={order.link} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm hidden lg:table-cell">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                        ₹{order.charge.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => setEditOrder(order)}
                            aria-label="Edit order"
                            data-ocid={`admin.orders.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {order.status !== "completed" &&
                            order.status !== "cancelled" &&
                            order.status !== "refunded" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setCancelOrder(order)}
                                aria-label="Cancel order"
                                data-ocid={`admin.orders.cancel_button.${i + 1}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paginated.length === 0 && (
              <div
                className="py-20 text-center space-y-2"
                data-ocid="admin.orders.empty_state"
              >
                <div className="text-4xl">📋</div>
                <p className="text-muted-foreground font-medium">
                  No orders found
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {page} of {totalPages} ·{" "}
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0"
                aria-label="Previous page"
                data-ocid="admin.orders.pagination_prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pageNum =
                  totalPages <= 7
                    ? i + 1
                    : page <= 4
                      ? i + 1
                      : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/60"
                    }`}
                    data-ocid={`admin.orders.page.${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0"
                aria-label="Next page"
                data-ocid="admin.orders.pagination_next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditOrderModal
        order={editOrder}
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
      />
      <CancelOrderModal
        order={cancelOrder}
        open={!!cancelOrder}
        onClose={() => setCancelOrder(null)}
      />
      <OrderDetailModal
        order={detailOrder}
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
      />
      <BulkCancelModal
        count={selected.size}
        open={bulkCancelOpen}
        onClose={() => setBulkCancelOpen(false)}
        onConfirm={handleBulkCancel}
        isPending={cancelMutation.isPending}
      />
    </>
  );
}
