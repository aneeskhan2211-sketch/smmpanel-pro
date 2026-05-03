import { PlatformLogo } from "@/components/PlatformLogo";
import { Button } from "@/components/ui/button";
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
  STATUS_CONFIG,
  getPlatformFromLink,
  useActiveOrdersPolling,
  useOrders,
} from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Eye, Plus, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.color.replace("text-", "bg-")}`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.color.replace("text-", "bg-")}`}
          />
        </span>
      )}
      {cfg.label}
    </span>
  );
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterTab = "all" | "active" | "completed" | "failed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

function filterOrders(orders: Order[], tab: FilterTab): Order[] {
  switch (tab) {
    case "active":
      return orders.filter((o) =>
        ["pending", "processing", "active"].includes(o.status),
      );
    case "completed":
      return orders.filter((o) => o.status === "completed");
    case "failed":
      return orders.filter((o) =>
        ["cancelled", "partial", "refunded"].includes(o.status),
      );
    default:
      return orders;
  }
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {["r0", "r1", "r2", "r3", "r4", "r5"].map((rk) => (
        <TableRow key={rk} className="border-border/50">
          {["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7"].map((ck) => (
            <TableCell key={ck}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateOrder }: { onCreateOrder: () => void }) {
  return (
    <motion.div
      data-ocid="orders.empty_state"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 space-y-5 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <ShoppingCart className="w-9 h-9 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-display font-semibold">No orders yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start by creating your first order to grow your social media presence.
        </p>
      </div>
      <Button
        data-ocid="orders.create_order_button"
        onClick={onCreateOrder}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Order
      </Button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const navigate = useNavigate();
  const { orders: rawOrders, isLoading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Sync orders once loaded
  if (!isLoading && orders.length === 0 && rawOrders.length > 0) {
    setOrders(rawOrders);
  }

  const handlePollingUpdate = useCallback((updated: Order[]) => {
    setOrders(updated);
  }, []);

  useActiveOrdersPolling(orders, handlePollingUpdate);

  const filtered = filterOrders(orders, activeTab);

  const tabCounts = {
    all: orders.length,
    active: orders.filter((o) =>
      ["pending", "processing", "active"].includes(o.status),
    ).length,
    completed: orders.filter((o) => o.status === "completed").length,
    failed: orders.filter((o) =>
      ["cancelled", "partial", "refunded"].includes(o.status),
    ).length,
  };

  return (
    <div data-ocid="orders.page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all your social media orders
          </p>
        </div>
        <Button
          data-ocid="orders.new_order_button"
          onClick={() => navigate({ to: "/new-order" })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Filter tabs */}
      <div
        data-ocid="orders.filter.tab"
        className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit border border-border/50"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            data-ocid={`orders.filter.${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-4">
                Order
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Service
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Link
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Qty
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Total
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    onCreateOrder={() => navigate({ to: "/new-order" })}
                  />
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((order, idx) => {
                  const platform = getPlatformFromLink(order.link);
                  const shortLink = order.link
                    .replace(/https?:\/\//, "")
                    .slice(0, 28);
                  const dateStr = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );

                  return (
                    <motion.tr
                      key={order.id}
                      data-ocid={`orders.item.${idx + 1}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-border/40 hover:bg-muted/30 transition-smooth cursor-pointer group"
                      onClick={() => navigate({ to: `/orders/${order.id}` })}
                    >
                      <TableCell className="pl-4 py-3">
                        <span className="font-mono text-xs font-semibold text-primary">
                          #{order.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                            <PlatformLogo platform={platform} size={16} />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[160px]">
                            {order.serviceName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          {shortLink}…
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-smooth" />
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-medium tabular-nums">
                          {order.quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-semibold text-green-400 tabular-nums">
                          ${order.charge.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground">
                          {dateStr}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`orders.view_button.${idx + 1}`}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-smooth"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({ to: `/orders/${order.id}` });
                          }}
                          aria-label="View order"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
