import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLogs } from "@/hooks/useAdmin";
import type { AdminLogFilters, SystemLog } from "@/types/admin";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "order_placed", label: "Order Placed" },
  { value: "payment", label: "Payment" },
  { value: "refund", label: "Refund" },
  { value: "user_ban", label: "User Ban" },
  { value: "price_change", label: "Price Change" },
  { value: "config_update", label: "Config Update" },
  { value: "provider_update", label: "Provider Update" },
  { value: "fraud_alert", label: "Fraud Alert" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
] as const;

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function exportCsv(logs: SystemLog[]) {
  const headers = [
    "Log ID",
    "Timestamp",
    "Action",
    "Actor ID",
    "Target Type",
    "Target ID",
    "Details",
    "Status",
  ];
  const rows = logs.map((l) => [
    l.id,
    formatTimestamp(l.timestamp),
    l.action,
    l.actorId,
    l.targetType,
    l.targetId,
    `"${l.details.replace(/"/g, '""')}"`,
    l.status,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `system-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SystemLog["status"] }) {
  if (status === "success") {
    return (
      <Badge className="bg-accent/15 text-accent border-accent/30 gap-1 text-xs">
        <CheckCircle className="h-3 w-3" />
        Success
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        Error
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 gap-1 text-xs">
      <AlertTriangle className="h-3 w-3" />
      Warning
    </Badge>
  );
}

function ActorCell({ actorId }: { actorId: string }) {
  const [tip, setTip] = useState(false);
  const isAdmin = actorId.startsWith("admin");
  return (
    <span className="relative inline-block">
      <button
        type="button"
        title={actorId}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        className={`font-mono text-xs cursor-default ${
          isAdmin ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {truncate(actorId, 14)}
      </button>
      {tip && (
        <span className="absolute bottom-full left-0 mb-1 z-50 px-2 py-1 rounded bg-popover border border-border text-xs text-foreground whitespace-nowrap shadow-lg">
          {actorId}
        </span>
      )}
    </span>
  );
}

function ExpandedPanel({ log }: { log: SystemLog }) {
  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <td
        colSpan={8}
        className={`px-6 py-4 border-b border-border/50 ${
          log.status === "error" ? "bg-destructive/10" : "bg-muted/20"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailField label="Log ID" value={log.id} mono />
          <DetailField label="Actor ID" value={log.actorId} mono />
          <DetailField
            label="Timestamp"
            value={formatTimestamp(log.timestamp)}
          />
          <DetailField label="Action" value={log.action} mono />
          <DetailField label="Target Type" value={log.targetType} />
          <DetailField label="Target ID" value={log.targetId} mono />
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
              Details
            </p>
            <p className="text-sm text-foreground">{log.details}</p>
          </div>
          <div className="flex gap-3">
            {log.targetType === "order" && (
              <a
                href={`/admin/orders?search=${log.targetId}`}
                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
              >
                View Order →
              </a>
            )}
            {log.targetType === "user" && (
              <a
                href={`/admin/users?search=${log.targetId}`}
                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
              >
                View User →
              </a>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

function DetailField({
  label,
  value,
  mono,
}: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const hookFilters: AdminLogFilters = {
    action: actionFilter !== "all" ? actionFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
  };

  const { data: logs, isLoading } = useAdminLogs(hookFilters);

  const filtered = (logs ?? []).filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.id.toLowerCase().includes(q) &&
        !l.actorId.toLowerCase().includes(q) &&
        !l.targetId.toLowerCase().includes(q) &&
        !l.details.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (l.timestamp < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86399999;
      if (l.timestamp > to) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters =
    actionFilter !== "all" || statusFilter !== "all" || !!dateFrom || !!dateTo;

  function clearFilters() {
    setActionFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6" data-ocid="admin.logs.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            System Logs
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Audit trail of all platform actions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="gap-2 shrink-0"
          data-ocid="admin.logs.export_button"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Log ID, User ID, or keyword…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            data-ocid="admin.logs.search_input"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2 h-10"
          data-ocid="admin.logs.filter_toggle"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-0.5 h-2 w-2 rounded-full bg-accent" />
          )}
        </Button>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <label
                  htmlFor="admin-logs-action"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Action Type
                </label>
                <select
                  id="admin-logs-action"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="admin.logs.action_filter_select"
                >
                  {ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <label
                  htmlFor="admin-logs-status"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Status
                </label>
                <select
                  id="admin-logs-status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="admin.logs.status_filter_select"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-logs-date-from"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  From Date
                </label>
                <input
                  id="admin-logs-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="admin.logs.date_from_input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-logs-date-to"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  To Date
                </label>
                <input
                  id="admin-logs-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="admin.logs.date_to_input"
                />
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  data-ocid="admin.logs.clear_filters_button"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-medium">
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          logs
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.logs.loading_state">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-8 px-3 py-3" />
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Log ID
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden sm:table-cell">
                    Actor
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">
                    Target
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">
                    Details
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginated.map((log, i) => (
                    <React.Fragment key={log.id}>
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.4) }}
                        onClick={() => toggleExpand(log.id)}
                        className={[
                          "border-b border-border/50 cursor-pointer transition-colors duration-150",
                          log.status === "error"
                            ? "bg-destructive/5 hover:bg-destructive/10"
                            : "hover:bg-muted/20",
                          expandedId === log.id ? "bg-muted/30" : "",
                        ].join(" ")}
                        data-ocid={`admin.logs.item.${(page - 1) * PAGE_SIZE + i + 1}`}
                      >
                        <td className="px-3 py-3">
                          {expandedId === log.id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {truncate(log.id, 12)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded font-mono">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <ActorCell actorId={log.actorId} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            <span className="text-secondary-foreground">
                              {log.targetType}
                            </span>
                            <span className="text-border">/</span>
                            <span className="font-mono">
                              {truncate(log.targetId, 12)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell max-w-[220px]">
                          <span className="text-xs text-muted-foreground block truncate">
                            {truncate(log.details, 60)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={log.status} />
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedId === log.id && (
                          <ExpandedPanel key={`${log.id}-detail`} log={log} />
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {paginated.length === 0 && (
            <div
              className="py-16 flex flex-col items-center gap-3 text-muted-foreground"
              data-ocid="admin.logs.empty_state"
            >
              <AlertCircle className="h-10 w-10 opacity-30" />
              <div className="text-center">
                <p className="font-medium text-foreground">No logs found</p>
                <p className="text-sm mt-0.5">
                  Try adjusting your search or filters
                </p>
              </div>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              data-ocid="admin.logs.pagination_prev"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-ocid="admin.logs.pagination_next"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
