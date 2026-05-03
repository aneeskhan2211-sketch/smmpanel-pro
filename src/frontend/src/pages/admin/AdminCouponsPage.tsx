import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { AdminCoupon } from "@/types/admin";
import { Edit2, Plus, RefreshCw, Search, Tag, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_COUPONS: AdminCoupon[] = [
  {
    id: "1",
    code: "WELCOME20",
    discountPercentage: 20,
    maxUsageCount: 500,
    usageCount: 247,
    expiryDate: Date.now() + 30 * 86400000,
    applicableServices: [],
    isActive: true,
    createdAt: Date.now() - 10 * 86400000,
    totalDiscountGiven: 12350,
  },
  {
    id: "2",
    code: "INSTA50",
    discountPercentage: 50,
    maxUsageCount: 100,
    usageCount: 100,
    expiryDate: Date.now() - 86400000,
    applicableServices: ["instagram"],
    isActive: false,
    createdAt: Date.now() - 30 * 86400000,
    totalDiscountGiven: 8200,
  },
  {
    id: "3",
    code: "PREMIUM15",
    discountPercentage: 15,
    maxUsageCount: 200,
    usageCount: 73,
    expiryDate: Date.now() + 60 * 86400000,
    applicableServices: [],
    isActive: true,
    createdAt: Date.now() - 5 * 86400000,
    totalDiscountGiven: 4380,
  },
  {
    id: "4",
    code: "NEWUSER10",
    discountPercentage: 10,
    maxUsageCount: 1000,
    usageCount: 512,
    expiryDate: Date.now() + 90 * 86400000,
    applicableServices: [],
    isActive: true,
    createdAt: Date.now() - 60 * 86400000,
    totalDiscountGiven: 21000,
  },
];

const SPIN_WHEEL_SLOTS = [
  { id: "sw1", name: "₹5 Cashback", discount: 5, weight: 30 },
  { id: "sw2", name: "₹10 Cashback", discount: 10, weight: 25 },
  { id: "sw3", name: "₹25 Cashback", discount: 25, weight: 15 },
  { id: "sw4", name: "₹50 Cashback", discount: 50, weight: 10 },
  { id: "sw5", name: "₹100 Cashback", discount: 100, weight: 8 },
  { id: "sw6", name: "2% Service Discount", discount: 2, weight: 5 },
  { id: "sw7", name: "5% Service Discount", discount: 5, weight: 5 },
  { id: "sw8", name: "Free Spin", discount: 0, weight: 2 },
];

type CouponStatus = "all" | "active" | "expired" | "disabled";

function getCouponStatus(c: AdminCoupon): "active" | "expired" | "disabled" {
  if (!c.isActive) return "disabled";
  if (c.expiryDate < Date.now()) return "expired";
  return "active";
}

function StatusBadge({
  status,
}: { status: "active" | "expired" | "disabled" }) {
  const map = {
    active: "bg-success/20 text-success",
    expired: "bg-destructive/20 text-destructive",
    disabled: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(MOCK_COUPONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<AdminCoupon | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");
  const [services, setServices] = useState<string>("All");
  const [active, setActive] = useState(true);

  // First-order config
  const [foEnabled, setFoEnabled] = useState(true);
  const [foDiscount, setFoDiscount] = useState("10");

  // Spin wheel slots
  const [spinSlots, setSpinSlots] = useState(SPIN_WHEEL_SLOTS);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotWeightInput, setSlotWeightInput] = useState("");

  const totalWeight = spinSlots.reduce((s, sl) => s + sl.weight, 0);

  const filtered = coupons.filter((c) => {
    const matchSearch =
      !search || c.code.toLowerCase().includes(search.toLowerCase());
    const status = getCouponStatus(c);
    const matchStatus = statusFilter === "all" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditCoupon(null);
    setCode("");
    setDiscount("");
    setExpiry("");
    setMaxUsage("100");
    setServices("All");
    setActive(true);
    setShowModal(true);
  }

  function openEdit(c: AdminCoupon) {
    setEditCoupon(c);
    setCode(c.code);
    setDiscount(String(c.discountPercentage));
    setExpiry(new Date(c.expiryDate).toISOString().slice(0, 10));
    setMaxUsage(String(c.maxUsageCount));
    setServices(
      c.applicableServices.length ? c.applicableServices.join(", ") : "All",
    );
    setActive(c.isActive);
    setShowModal(true);
  }

  function handleSave() {
    if (!code.trim() || !discount || !expiry) {
      toast.error("Please fill all required fields");
      return;
    }
    const expiryTs = new Date(expiry).getTime();
    if (expiryTs <= Date.now() && !editCoupon) {
      toast.error("Expiry must be in the future");
      return;
    }
    const existing = coupons.find(
      (c) => c.code === code.toUpperCase() && c.id !== editCoupon?.id,
    );
    if (existing) {
      toast.error("Coupon code already exists");
      return;
    }
    if (editCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editCoupon.id
            ? {
                ...c,
                code: code.toUpperCase(),
                discountPercentage: Number(discount),
                expiryDate: expiryTs,
                maxUsageCount: Number(maxUsage),
                applicableServices:
                  services === "All"
                    ? []
                    : services.split(",").map((s) => s.trim()),
                isActive: active,
              }
            : c,
        ),
      );
      toast.success("Coupon updated");
    } else {
      const newC: AdminCoupon = {
        id: String(Date.now()),
        code: code.toUpperCase(),
        discountPercentage: Number(discount),
        maxUsageCount: Number(maxUsage),
        usageCount: 0,
        expiryDate: expiryTs,
        applicableServices:
          services === "All" ? [] : services.split(",").map((s) => s.trim()),
        isActive: active,
        createdAt: Date.now(),
        totalDiscountGiven: 0,
      };
      setCoupons((prev) => [newC, ...prev]);
      toast.success("Coupon created");
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted");
  }

  function handleDisable(id: string) {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)),
    );
    toast.success("Coupon disabled");
  }

  function saveSlotWeight(id: string) {
    const w = Number(slotWeightInput);
    if (Number.isNaN(w) || w < 1) {
      toast.error("Weight must be ≥ 1");
      return;
    }
    setSpinSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, weight: w } : s)),
    );
    setEditingSlotId(null);
    toast.success("Slot updated");
  }

  const STATUS_FILTERS: { label: string; value: CouponStatus }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Expired", value: "expired" },
    { label: "Disabled", value: "disabled" },
  ];

  return (
    <div className="p-6 space-y-8" data-ocid="admin.coupons.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" /> Coupon Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, configure, and manage discount coupons and spin wheel
            rewards.
          </p>
        </div>
        <Button onClick={openCreate} data-ocid="admin.coupons.create_button">
          <Plus className="h-4 w-4 mr-1" /> New Coupon
        </Button>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.coupons.search_input"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              data-ocid={`admin.coupons.filter.${f.value}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Coupons Table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  "Code",
                  "Discount",
                  "Used / Max",
                  "Applicable",
                  "Expires",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                    data-ocid="admin.coupons.empty_state"
                  >
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.coupons.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {c.discountPercentage}%
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {c.usageCount}
                        </span>{" "}
                        / {c.maxUsageCount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.applicableServices.length
                          ? c.applicableServices.join(", ")
                          : "All Services"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                            data-ocid={`admin.coupons.edit_button.${i + 1}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {c.isActive && (
                            <button
                              type="button"
                              onClick={() => handleDisable(c.id)}
                              className="p-1.5 rounded-md hover:bg-warning/20 transition-colors text-muted-foreground hover:text-warning"
                              title="Disable"
                              data-ocid={`admin.coupons.disable_button.${i + 1}`}
                            >
                              <Zap className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete"
                            data-ocid={`admin.coupons.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── First-Order Discount ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              First-Order Discount
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically applied on a new user's first order.
            </p>
          </div>
          <Switch
            checked={foEnabled}
            onCheckedChange={setFoEnabled}
            data-ocid="admin.coupons.first_order_toggle"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Discount %</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={foDiscount}
              onChange={(e) => setFoDiscount(e.target.value)}
              disabled={!foEnabled}
              data-ocid="admin.coupons.first_order_discount_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Code Preview</Label>
            <div className="px-3 py-2 rounded-md bg-muted font-mono text-sm text-primary border border-border">
              FIRST{foDiscount || "10"}
            </div>
          </div>
          <Button
            disabled={!foEnabled}
            onClick={() => toast.success("First-order discount saved")}
            data-ocid="admin.coupons.first_order_save_button"
          >
            Save
          </Button>
        </div>
      </div>

      {/* ── Spin Wheel Rewards Pool ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Spin Wheel Rewards Pool
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure the 8 reward slots. Total probability weight must sum to
              100.
            </p>
          </div>
          <Badge
            className={
              totalWeight === 100
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            }
          >
            Total: {totalWeight} / 100
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  "Slot",
                  "Reward Name",
                  "Discount / Value",
                  "Probability Weight",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spinSlots.map((s, idx) => (
                <tr
                  key={s.id}
                  className="border-t border-border"
                  data-ocid={`admin.coupons.spin_slot.${idx + 1}`}
                >
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                    #{idx + 1}
                  </td>
                  <td className="px-3 py-2 font-medium text-foreground">
                    {s.name}
                  </td>
                  <td className="px-3 py-2 text-primary font-semibold">
                    {s.discount > 0 ? `${s.discount}%` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {editingSlotId === s.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          className="w-20 h-7 text-sm"
                          value={slotWeightInput}
                          onChange={(e) => setSlotWeightInput(e.target.value)}
                          data-ocid={`admin.coupons.spin_weight_input.${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => saveSlotWeight(s.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlotId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium">{s.weight}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlotId(s.id);
                        setSlotWeightInput(String(s.weight));
                      }}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid={`admin.coupons.spin_edit_button.${idx + 1}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg" data-ocid="admin.coupons.dialog">
          <DialogHeader>
            <DialogTitle>
              {editCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  className="font-mono uppercase"
                  data-ocid="admin.coupons.code_input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCode(generateCode())}
                  title="Auto-generate"
                  data-ocid="admin.coupons.generate_code_button"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Discount % (1–100) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="20"
                  data-ocid="admin.coupons.discount_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Usage Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  data-ocid="admin.coupons.max_usage_input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                data-ocid="admin.coupons.expiry_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Applicable Services</Label>
              <Input
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="All (or comma-separated: instagram, youtube)"
                data-ocid="admin.coupons.services_input"
              />
              <p className="text-xs text-muted-foreground">
                Use "All" to apply to every service.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={active}
                onCheckedChange={setActive}
                data-ocid="admin.coupons.active_toggle"
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="admin.coupons.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="admin.coupons.submit_button"
            >
              {editCoupon ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
