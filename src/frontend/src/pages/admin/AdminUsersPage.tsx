import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAdjustWallet,
  useAdminBanUser,
  useAdminUsers,
} from "@/hooks/useAdmin";
import type { AdminUser } from "@/types/admin";
import {
  Calendar,
  DollarSign,
  Eye,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PAGE_SIZE = 50;

const TIER_CLASSES: Record<string, string> = {
  free: "bg-muted text-muted-foreground border-border",
  pro: "bg-accent/15 text-accent border-accent/30",
  premium: "bg-primary/15 text-primary border-primary/30",
};

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-accent/15 text-accent border-accent/30",
  banned: "bg-destructive/15 text-destructive border-destructive/30",
  suspended: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateId(id: string) {
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailModal({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const statItems = [
    { label: "Total Orders", value: "38" },
    { label: "Active", value: "4" },
    { label: "Completed", value: "32" },
    { label: "Total Spend", value: `₹${user.totalSpend.toFixed(2)}` },
  ];

  const recentOrders = [
    {
      id: "ORD-1092",
      service: "Instagram Followers",
      qty: 1000,
      status: "completed",
      charge: 45,
    },
    {
      id: "ORD-1088",
      service: "YouTube Views",
      qty: 5000,
      status: "processing",
      charge: 120,
    },
    {
      id: "ORD-1075",
      service: "TikTok Likes",
      qty: 500,
      status: "completed",
      charge: 18,
    },
    {
      id: "ORD-1062",
      service: "Twitter Retweets",
      qty: 200,
      status: "completed",
      charge: 14,
    },
    {
      id: "ORD-1051",
      service: "Facebook Likes",
      qty: 300,
      status: "cancelled",
      charge: 0,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="admin.users.user_detail.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-base font-bold text-primary">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                {user.username}
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30 font-semibold">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                {user.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {statItems.map((s) => (
              <div
                key={s.label}
                className="bg-muted/40 rounded-lg p-2.5 text-center"
              >
                <div className="text-base font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Subscription + wallet row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Subscription</p>
              <p className="text-sm font-semibold capitalize text-foreground mt-0.5">
                {user.subscriptionTier}
              </p>
            </div>
            <div className="flex-1 bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                ₹{user.walletBalance.toFixed(2)}
              </p>
            </div>
            <div className="flex-1 bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">API Keys</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {user.apiKey ? 1 : 0}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Joined {formatDate(user.createdAt)}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Last login {formatDate(user.lastLogin)}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>
              ID:{" "}
              <code className="font-mono text-foreground/70">
                {truncateId(user.id)}
              </code>
            </span>
          </div>

          <Separator />

          {/* Recent orders */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Last 5 Orders
            </p>
            <div className="space-y-1.5">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {o.id}
                    </span>
                    <span className="truncate text-foreground">
                      {o.service}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      ×{o.qty.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-foreground font-medium">
                      ₹{o.charge}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs border ${STATUS_CLASSES[o.status] ?? ""}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.users.user_detail.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ban User Modal ───────────────────────────────────────────────────────────
function BanUserModal({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const banUser = useAdminBanUser();

  const handleSubmit = () => {
    if (!user || !reason.trim()) return;
    banUser.mutate(
      { userId: user.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm bg-card border-border"
        data-ocid="admin.users.ban_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldOff className="h-5 w-5" />
            Ban User
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          You are about to ban{" "}
          <span className="font-semibold text-foreground">
            {user?.username}
          </span>
          . They will lose access immediately.
        </p>

        <div className="space-y-2">
          <Label htmlFor="ban-reason" className="text-sm">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="ban-reason"
            placeholder="Describe the reason for ban…"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none"
            data-ocid="admin.users.ban_modal.textarea"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.users.ban_modal.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || banUser.isPending}
            data-ocid="admin.users.ban_modal.confirm_button"
          >
            {banUser.isPending ? "Banning…" : "Ban User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Wallet Adjust Modal ──────────────────────────────────────────────────────
function WalletAdjustModal({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const adjustWallet = useAdminAdjustWallet();

  const handleSubmit = () => {
    if (!user || !amount || !reason.trim()) return;
    const num = Number.parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) return;
    adjustWallet.mutate(
      {
        userId: user.id,
        amount: mode === "debit" ? -num : num,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setAmount("");
          setReason("");
          setMode("credit");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm bg-card border-border"
        data-ocid="admin.users.wallet_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Adjust Wallet
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Current balance:{" "}
          <span className="font-semibold text-foreground">
            ₹{user?.walletBalance.toFixed(2)}
          </span>
        </p>

        {/* Credit / Debit toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("credit")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-smooth ${
              mode === "credit"
                ? "bg-accent/15 text-accent border-accent/30"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/60"
            }`}
            data-ocid="admin.users.wallet_modal.credit_toggle"
          >
            + Credit
          </button>
          <button
            type="button"
            onClick={() => setMode("debit")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-smooth ${
              mode === "debit"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/60"
            }`}
            data-ocid="admin.users.wallet_modal.debit_toggle"
          >
            − Debit
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="wallet-amount" className="text-sm">
              Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="wallet-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-ocid="admin.users.wallet_modal.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wallet-reason" className="text-sm">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="wallet-reason"
              placeholder="Reason for adjustment…"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              data-ocid="admin.users.wallet_modal.textarea"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.users.wallet_modal.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || !reason.trim() || adjustWallet.isPending}
            data-ocid="admin.users.wallet_modal.confirm_button"
          >
            {adjustWallet.isPending ? "Applying…" : "Apply"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<
    "all" | "free" | "pro" | "premium"
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">(
    "all",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [walletTarget, setWalletTarget] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useAdminUsers();

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (
        search &&
        !u.username.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (tierFilter !== "all" && u.subscriptionTier !== tierFilter)
        return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (dateFrom && u.createdAt < new Date(dateFrom).getTime()) return false;
      if (dateTo && u.createdAt > new Date(dateTo).getTime() + 86400000)
        return false;
      return true;
    });
  }, [users, search, tierFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleTierChange = (v: typeof tierFilter) => {
    setTierFilter(v);
    setPage(1);
  };
  const handleStatusChange = (v: typeof statusFilter) => {
    setStatusFilter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6" data-ocid="admin.users.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Users
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {filtered.length} of {users?.length ?? 0} registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-card border border-border rounded-xl p-4 space-y-3"
        data-ocid="admin.users.filter_panel"
      >
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg
              aria-hidden="true"
              role="presentation"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <Input
            placeholder="Search by username or email…"
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            data-ocid="admin.users.search_input"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Tier filter */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Subscription Tier
            </Label>
            <div className="flex gap-1">
              {(["all", "free", "pro", "premium"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTierChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                    tierFilter === t
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/60"
                  }`}
                  data-ocid="admin.users.tier_filter.tab"
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <div className="flex gap-1">
              {(["all", "active", "banned"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                    statusFilter === s
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/60"
                  }`}
                  data-ocid="admin.users.status_filter.tab"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-end gap-2 ml-auto">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> From
              </Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                data-ocid="admin.users.date_from.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                data-ocid="admin.users.date_to.input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.users.loading_state">
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
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    Username
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                    Total Spend
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">
                    Join Date
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-smooth group"
                    data-ocid={`admin.users.item.${i + 1}`}
                  >
                    {/* User ID */}
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                        {truncateId(user.id)}
                      </code>
                    </td>

                    {/* Username + admin badge */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {user.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium truncate">
                            {user.username}
                          </span>
                          {user.role === "admin" && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30 font-semibold shrink-0">
                              <ShieldCheck className="h-2.5 w-2.5" /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell max-w-[180px]">
                      <span className="truncate block">
                        {user.email || "—"}
                      </span>
                    </td>

                    {/* Tier badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${TIER_CLASSES[user.subscriptionTier] ?? ""}`}
                      >
                        {user.subscriptionTier}
                      </span>
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      ₹{user.walletBalance.toFixed(2)}
                    </td>

                    {/* Total spend */}
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums hidden md:table-cell">
                      ₹{user.totalSpend.toFixed(2)}
                    </td>

                    {/* Join date */}
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${STATUS_CLASSES[user.status] ?? ""}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                          title="View profile"
                          onClick={() => setDetailUser(user)}
                          aria-label="View user profile"
                          data-ocid={`admin.users.view_button.${i + 1}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-accent/10 hover:text-accent"
                          title="Adjust wallet"
                          onClick={() => setWalletTarget(user)}
                          aria-label="Adjust wallet balance"
                          data-ocid={`admin.users.adjust_wallet_button.${i + 1}`}
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                        {user.status !== "banned" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Ban user"
                            onClick={() => setBanTarget(user)}
                            aria-label="Ban user"
                            data-ocid={`admin.users.ban_button.${i + 1}`}
                          >
                            <ShieldBan className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {pageData.length === 0 && (
            <div
              className="py-16 text-center"
              data-ocid="admin.users.empty_state"
            >
              <ShieldOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No users match your filters
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Try adjusting the search or filter criteria
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  data-ocid="admin.users.pagination_prev"
                >
                  Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPage(pg)}
                      className={`h-7 w-7 rounded-lg text-xs font-medium transition-smooth ${
                        page === pg
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  data-ocid="admin.users.pagination_next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UserDetailModal
        user={detailUser}
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
      />
      <BanUserModal
        user={banTarget}
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
      />
      <WalletAdjustModal
        user={walletTarget}
        open={!!walletTarget}
        onClose={() => setWalletTarget(null)}
      />
    </div>
  );
}
