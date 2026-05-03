import {
  type Transaction,
  TransactionStatus,
  TransactionType,
  type UserId,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateCheckoutSession,
  useTransactions,
  useWalletBalance,
} from "@/hooks/useWallet";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type TxFilter = "all" | TransactionType;

const EMPTY_UID = "" as unknown as UserId;

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

// ─── Mock data (10 sample transactions) ───────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: BigInt(1),
    txType: TransactionType.credit,
    amount: BigInt(50000),
    description: "Wallet top-up via Stripe",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 0),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(2),
    txType: TransactionType.debit,
    amount: BigInt(8500),
    description: "Order #1042 — Instagram Followers ×1000",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 1),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(3),
    txType: TransactionType.debit,
    amount: BigInt(3200),
    description: "Order #1041 — YouTube Views ×5000",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 2),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(4),
    txType: TransactionType.refund,
    amount: BigInt(3200),
    description: "Refund — Order #1038 cancelled",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 3),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(5),
    txType: TransactionType.credit,
    amount: BigInt(100000),
    description: "Wallet top-up via Stripe",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 4),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(6),
    txType: TransactionType.debit,
    amount: BigInt(12000),
    description: "Order #1040 — TikTok Likes ×2000",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 5),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(7),
    txType: TransactionType.debit,
    amount: BigInt(5500),
    description: "Order #1039 — Facebook Followers ×500",
    status: TransactionStatus.pending,
    createdAt: BigInt(Date.now() - 86400000 * 6),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(8),
    txType: TransactionType.credit,
    amount: BigInt(20000),
    description: "Wallet top-up via Stripe",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 7),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(9),
    txType: TransactionType.debit,
    amount: BigInt(9800),
    description: "Order #1037 — Twitter Followers ×800",
    status: TransactionStatus.failed,
    createdAt: BigInt(Date.now() - 86400000 * 8),
    userId: EMPTY_UID,
  },
  {
    id: BigInt(10),
    txType: TransactionType.refund,
    amount: BigInt(9800),
    description: "Refund — Order #1037 failed",
    status: TransactionStatus.completed,
    createdAt: BigInt(Date.now() - 86400000 * 9),
    userId: EMPTY_UID,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRupees(paise: bigint) {
  return `₹${(Number(paise) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(transactions: Transaction[]) {
  const header = ["Date", "Type", "Description", "Amount (₹)", "Status"];
  const rows = transactions.map((tx) => [
    formatDate(tx.createdAt),
    tx.txType,
    `"${tx.description}"`,
    tx.txType === TransactionType.debit
      ? `-${(Number(tx.amount) / 100).toFixed(2)}`
      : `+${(Number(tx.amount) / 100).toFixed(2)}`,
    tx.status,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function TxTypeBadge({ type }: { type: TransactionType }) {
  if (type === TransactionType.credit)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
        <ArrowDownLeft className="w-3 h-3" /> Credit
      </span>
    );
  if (type === TransactionType.refund)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400">
        <RefreshCw className="w-3 h-3" /> Refund
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400">
      <ArrowUpRight className="w-3 h-3" /> Debit
    </span>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === TransactionStatus.completed)
    return (
      <Badge className="bg-green-500/15 text-green-400 border-0 text-xs">
        Completed
      </Badge>
    );
  if (status === TransactionStatus.pending)
    return (
      <Badge className="bg-blue-500/15 text-primary border-0 text-xs">
        Pending
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-400 border-0 text-xs">
      Failed
    </Badge>
  );
}

// ─── Add Funds Modal ─────────────────────────────────────────────────────────
function AddFundsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const checkout = useCreateCheckoutSession();

  async function handleCheckout() {
    const val = Number(amount);
    if (!val || val < 10) {
      setError("Minimum amount is ₹10");
      return;
    }
    setError("");
    try {
      const session = await checkout.mutateAsync(val);
      if (!session?.url) throw new Error("Stripe session missing url");
      window.location.href = session.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-sm"
        data-ocid="add_funds.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Add Funds
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                data-ocid={`add_funds.preset_${amt}`}
                onClick={() => setAmount(String(amt))}
                className={`py-2 rounded-lg text-sm font-semibold border transition-smooth ${
                  amount === String(amt)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border hover:border-primary text-foreground"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="custom-amount"
            >
              Custom Amount (₹)
            </label>
            <Input
              id="custom-amount"
              data-ocid="add_funds.amount_input"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              className="bg-secondary border-border"
              min={10}
            />
            {error && (
              <p
                data-ocid="add_funds.field_error"
                className="text-xs text-red-400"
              >
                {error}
              </p>
            )}
          </div>

          <Button
            type="button"
            data-ocid="add_funds.submit_button"
            className="w-full bg-primary hover:bg-primary/90 font-semibold"
            onClick={handleCheckout}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Redirecting to
                Stripe…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Pay with Stripe
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secured by Stripe · Instant wallet credit after payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── WalletPage ───────────────────────────────────────────────────────────────
export function WalletPage() {
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const transactions: Transaction[] =
    txData && txData.length > 0 ? txData : MOCK_TRANSACTIONS;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = txFilter === "all" || tx.txType === txFilter;
      const txDate = new Date(Number(tx.createdAt));
      const afterStart = startDate ? txDate >= new Date(startDate) : true;
      const beforeEnd = endDate
        ? txDate <= new Date(`${endDate}T23:59:59`)
        : true;
      return matchesType && afterStart && beforeEnd;
    });
  }, [transactions, txFilter, startDate, endDate]);

  const displayBalance = balance !== undefined ? Number(balance) / 100 : 163605;

  const filterTabs: { label: string; value: TxFilter }[] = [
    { label: "All", value: "all" },
    { label: "Credits", value: TransactionType.credit },
    { label: "Debits", value: TransactionType.debit },
    { label: "Refunds", value: TransactionType.refund },
  ];

  const statCards = [
    {
      label: "Total Deposited",
      value: `₹${(
        MOCK_TRANSACTIONS.filter(
          (t) => t.txType === TransactionType.credit,
        ).reduce((s, t) => s + Number(t.amount), 0) / 100
      ).toLocaleString("en-IN")}`,
      color: "text-green-400",
    },
    {
      label: "Total Spent",
      value: `₹${(
        MOCK_TRANSACTIONS.filter(
          (t) => t.txType === TransactionType.debit,
        ).reduce((s, t) => s + Number(t.amount), 0) / 100
      ).toLocaleString("en-IN")}`,
      color: "text-red-400",
    },
    {
      label: "Total Refunded",
      value: `₹${(
        MOCK_TRANSACTIONS.filter(
          (t) => t.txType === TransactionType.refund,
        ).reduce((s, t) => s + Number(t.amount), 0) / 100
      ).toLocaleString("en-IN")}`,
      color: "text-purple-400",
    },
    {
      label: "Transactions",
      value: String(MOCK_TRANSACTIONS.length),
      color: "text-primary",
    },
  ];

  return (
    <div data-ocid="wallet.page" className="space-y-6">
      <AddFundsModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── Hero Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-card border border-border p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-elevated"
      >
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-body uppercase tracking-widest">
            Wallet Balance
          </p>
          {balanceLoading ? (
            <Skeleton
              className="h-12 w-48"
              data-ocid="wallet.balance_loading_state"
            />
          ) : (
            <p
              data-ocid="wallet.balance_display"
              className="text-5xl font-display font-bold text-green-400 tracking-tight"
            >
              ₹
              {displayBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Available for orders</p>
        </div>
        <Button
          type="button"
          data-ocid="wallet.add_funds_button"
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 text-base glow-primary transition-smooth"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 card-hover"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-xl font-display font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Transactions Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                data-ocid={`wallet.filter.${tab.value}`}
                onClick={() => setTxFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                  txFilter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              data-ocid="wallet.start_date_input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <input
              type="date"
              data-ocid="wallet.end_date_input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="button"
              data-ocid="wallet.export_csv_button"
              variant="outline"
              size="sm"
              onClick={() => exportCSV(filtered)}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Table body */}
        {txLoading ? (
          <div
            data-ocid="wallet.transactions_loading_state"
            className="p-4 space-y-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="wallet.transactions_empty_state"
            className="py-20 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                No transactions yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add funds to start ordering!
              </p>
            </div>
            <Button
              type="button"
              data-ocid="wallet.empty_add_funds_button"
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Add Funds
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Type", "Description", "Amount", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left ${
                          h === "Amount" || h === "Status" ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, idx) => (
                  <motion.tr
                    key={String(tx.id)}
                    data-ocid={`wallet.transaction.item.${idx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <TxTypeBadge type={tx.txType} />
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold text-right tabular-nums ${
                        tx.txType === TransactionType.debit
                          ? "text-red-400"
                          : tx.txType === TransactionType.refund
                            ? "text-purple-400"
                            : "text-green-400"
                      }`}
                    >
                      {tx.txType === TransactionType.debit ? "-" : "+"}
                      {formatRupees(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={tx.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
