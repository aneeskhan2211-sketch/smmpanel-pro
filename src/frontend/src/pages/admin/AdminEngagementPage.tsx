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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { UserLevel } from "@/types";
import {
  Bell,
  Edit2,
  Gift,
  MessageSquare,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_LEVELS: UserLevel[] = [
  {
    id: "1",
    levelName: "bronze",
    displayName: "Bronze",
    badge: "🥉",
    minSpend: 0,
    maxSpend: 999,
    cashbackPercent: 1,
    perks: ["Basic support", "Standard delivery"],
  },
  {
    id: "2",
    levelName: "silver",
    displayName: "Silver",
    badge: "🥈",
    minSpend: 1000,
    maxSpend: 4999,
    cashbackPercent: 3,
    perks: ["Priority support", "Faster delivery", "Monthly coupon"],
  },
  {
    id: "3",
    levelName: "gold",
    displayName: "Gold",
    badge: "🥇",
    minSpend: 5000,
    maxSpend: 19999,
    cashbackPercent: 5,
    perks: [
      "Dedicated support",
      "Priority queue",
      "Weekly coupon",
      "Spin wheel +1",
    ],
  },
  {
    id: "4",
    levelName: "platinum",
    displayName: "Platinum",
    badge: "💎",
    minSpend: 20000,
    maxSpend: 999999,
    cashbackPercent: 8,
    perks: [
      "VIP support",
      "Express delivery",
      "Daily coupon",
      "Free spin wheel",
      "Exclusive services",
    ],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  bronze: "text-orange-400",
  silver: "text-slate-400",
  gold: "text-yellow-400",
  platinum: "text-cyan-400",
};

const ORDER_TRIGGERS = [
  { key: "placed", label: "Order Placed" },
  { key: "payment_received", label: "Payment Received" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "refund_initiated", label: "Refund Initiated" },
];

export function AdminEngagementPage() {
  const [levels, setLevels] = useState<UserLevel[]>(MOCK_LEVELS);
  const [editLevel, setEditLevel] = useState<UserLevel | null>(null);
  const [editCashback, setEditCashback] = useState("");
  const [editPerks, setEditPerks] = useState("");

  // Daily Login Reward
  const [dailyAmount, setDailyAmount] = useState("10");
  const [dailyMaxMonth, setDailyMaxMonth] = useState("300");
  const [dailyEnabled, setDailyEnabled] = useState(true);

  // Referral Commission
  const [referralPercent, setReferralPercent] = useState("5");
  const [referralMinPayout, setReferralMinPayout] = useState("100");
  const [referralWallet, setReferralWallet] = useState(true);

  // Cashback Settings
  const [cbPercent, setCbPercent] = useState("3");
  const [cbMinOrder, setCbMinOrder] = useState("200");
  const [cbMaxPerOrder, setCbMaxPerOrder] = useState("50");

  // Abandoned Cart
  const [abandonedEnabled, setAbandonedEnabled] = useState(true);
  const [abandonedDelay, setAbandonedDelay] = useState("1");
  const [abandonedMsg, setAbandonedMsg] = useState(
    "You left items in your cart! Complete your order now and get priority processing.",
  );

  // Notifications
  const [waEnabled, setWaEnabled] = useState(true);
  const [waTemplate, setWaTemplate] = useState(
    "Hi {{name}}, your order #{{orderId}} status is now {{status}}. Login to track: {{link}}",
  );
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [triggers, setTriggers] = useState<Record<string, boolean>>(
    Object.fromEntries(ORDER_TRIGGERS.map((t) => [t.key, true])),
  );

  function openEditLevel(level: UserLevel) {
    setEditLevel(level);
    setEditCashback(String(level.cashbackPercent));
    setEditPerks(level.perks.join("\n"));
  }

  function saveLevel() {
    if (!editLevel) return;
    setLevels((prev) =>
      prev.map((l) =>
        l.id === editLevel.id
          ? {
              ...l,
              cashbackPercent: Number(editCashback),
              perks: editPerks
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean),
            }
          : l,
      ),
    );
    setEditLevel(null);
    toast.success("Level updated");
  }

  return (
    <div className="p-6 space-y-8" data-ocid="admin.engagement.page">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" /> Engagement Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure user levels, rewards, referrals, cashback, and notification
          systems.
        </p>
      </div>

      {/* ── User Levels ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">
            User Levels
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {[
                    "Level",
                    "Spend Range",
                    "Cashback %",
                    "Perks",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.map((level, i) => (
                  <tr
                    key={level.id}
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.engagement.level.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold text-base ${LEVEL_COLORS[level.levelName] ?? "text-foreground"}`}
                      >
                        {level.badge} {level.displayName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      ₹{level.minSpend.toLocaleString()} – ₹
                      {level.maxSpend.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-success/20 text-success">
                        {level.cashbackPercent}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {level.perks.slice(0, 2).join(", ")}
                      {level.perks.length > 2 &&
                        ` +${level.perks.length - 2} more`}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEditLevel(level)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid={`admin.engagement.level_edit_button.${i + 1}`}
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
      </section>

      {/* ── Daily Login Reward ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Daily Login Reward
            </h2>
          </div>
          <Switch
            checked={dailyEnabled}
            onCheckedChange={setDailyEnabled}
            data-ocid="admin.engagement.daily_toggle"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Reward Amount (₹/day)</Label>
            <Input
              type="number"
              min="1"
              value={dailyAmount}
              onChange={(e) => setDailyAmount(e.target.value)}
              disabled={!dailyEnabled}
              data-ocid="admin.engagement.daily_amount_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max Per Month (₹)</Label>
            <Input
              type="number"
              min="1"
              value={dailyMaxMonth}
              onChange={(e) => setDailyMaxMonth(e.target.value)}
              disabled={!dailyEnabled}
              data-ocid="admin.engagement.daily_max_input"
            />
          </div>
          <Button
            disabled={!dailyEnabled}
            onClick={() => toast.success("Daily reward settings saved")}
            data-ocid="admin.engagement.daily_save_button"
          >
            Save
          </Button>
        </div>
      </section>

      {/* ── Referral Commission ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Referral Commission
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Commission %</Label>
            <Input
              type="number"
              min="0"
              max="50"
              value={referralPercent}
              onChange={(e) => setReferralPercent(e.target.value)}
              data-ocid="admin.engagement.referral_percent_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Min Payout Threshold (₹)</Label>
            <Input
              type="number"
              min="0"
              value={referralMinPayout}
              onChange={(e) => setReferralMinPayout(e.target.value)}
              data-ocid="admin.engagement.referral_min_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Payout Method</Label>
            <div className="flex items-center gap-3 h-10">
              <span
                className={`text-sm ${referralWallet ? "text-foreground font-medium" : "text-muted-foreground"}`}
              >
                Wallet Credit
              </span>
              <Switch
                checked={!referralWallet}
                onCheckedChange={(v) => setReferralWallet(!v)}
                data-ocid="admin.engagement.referral_payout_toggle"
              />
              <span
                className={`text-sm ${!referralWallet ? "text-foreground font-medium" : "text-muted-foreground"}`}
              >
                Manual
              </span>
            </div>
          </div>
          <Button
            onClick={() => toast.success("Referral settings saved")}
            data-ocid="admin.engagement.referral_save_button"
          >
            Save
          </Button>
        </div>
      </section>

      {/* ── Cashback Settings ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Cashback Settings
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Cashback % on Repeat Orders</Label>
            <Input
              type="number"
              min="0"
              max="20"
              value={cbPercent}
              onChange={(e) => setCbPercent(e.target.value)}
              data-ocid="admin.engagement.cashback_percent_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Min Order Amount (₹)</Label>
            <Input
              type="number"
              min="0"
              value={cbMinOrder}
              onChange={(e) => setCbMinOrder(e.target.value)}
              data-ocid="admin.engagement.cashback_min_order_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max Cashback Per Order (₹)</Label>
            <Input
              type="number"
              min="0"
              value={cbMaxPerOrder}
              onChange={(e) => setCbMaxPerOrder(e.target.value)}
              data-ocid="admin.engagement.cashback_max_input"
            />
          </div>
          <Button
            onClick={() => toast.success("Cashback settings saved")}
            data-ocid="admin.engagement.cashback_save_button"
          >
            Save
          </Button>
        </div>
      </section>

      {/* ── Abandoned Cart Reminder ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Abandoned Cart Reminder
            </h2>
          </div>
          <Switch
            checked={abandonedEnabled}
            onCheckedChange={setAbandonedEnabled}
            data-ocid="admin.engagement.abandoned_toggle"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Delay (hours)</Label>
            <Input
              type="number"
              min="0.5"
              step="0.5"
              value={abandonedDelay}
              onChange={(e) => setAbandonedDelay(e.target.value)}
              disabled={!abandonedEnabled}
              data-ocid="admin.engagement.abandoned_delay_input"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Reminder Message</Label>
            <Input
              value={abandonedMsg}
              onChange={(e) => setAbandonedMsg(e.target.value)}
              disabled={!abandonedEnabled}
              data-ocid="admin.engagement.abandoned_msg_input"
            />
          </div>
          <Button
            disabled={!abandonedEnabled}
            onClick={() => toast.success("Abandoned cart settings saved")}
            data-ocid="admin.engagement.abandoned_save_button"
          >
            Save
          </Button>
        </div>
      </section>

      {/* ── Notification Settings ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Notification Settings
          </h2>
        </div>

        {/* WhatsApp */}
        <div className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-success" />
              <span className="font-medium text-foreground text-sm">
                WhatsApp Notifications
              </span>
            </div>
            <Switch
              checked={waEnabled}
              onCheckedChange={setWaEnabled}
              data-ocid="admin.engagement.wa_toggle"
            />
          </div>
          {waEnabled && (
            <div className="space-y-1.5">
              <Label>Template Message</Label>
              <Textarea
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                rows={2}
                className="text-sm"
                data-ocid="admin.engagement.wa_template_input"
              />
              <p className="text-xs text-muted-foreground">
                Available variables:{" "}
                {"{{name}}, {{orderId}}, {{status}}, {{link}}"}
              </p>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground text-sm">
                Email Notifications
              </span>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              data-ocid="admin.engagement.email_toggle"
            />
          </div>

          {/* Order trigger checkboxes */}
          <div className="space-y-1.5">
            <Label>Order Status Triggers</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {ORDER_TRIGGERS.map((trigger) => (
                <label
                  key={trigger.key}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={triggers[trigger.key] ?? false}
                    onChange={(e) =>
                      setTriggers((prev) => ({
                        ...prev,
                        [trigger.key]: e.target.checked,
                      }))
                    }
                    disabled={!emailEnabled}
                    className="accent-primary h-4 w-4"
                    data-ocid={`admin.engagement.trigger_${trigger.key}`}
                  />
                  <span
                    className={`text-sm ${emailEnabled ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {trigger.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={() => toast.success("Notification settings saved")}
          data-ocid="admin.engagement.notifications_save_button"
        >
          Save Notification Settings
        </Button>
      </section>

      {/* ── Edit Level Modal ── */}
      <Dialog
        open={!!editLevel}
        onOpenChange={(open) => !open && setEditLevel(null)}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="admin.engagement.level_dialog"
        >
          <DialogHeader>
            <DialogTitle>
              Edit {editLevel?.badge} {editLevel?.displayName} Level
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Cashback %</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={editCashback}
                onChange={(e) => setEditCashback(e.target.value)}
                data-ocid="admin.engagement.level_cashback_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Perks (one per line)</Label>
              <Textarea
                value={editPerks}
                onChange={(e) => setEditPerks(e.target.value)}
                rows={5}
                placeholder="Priority support&#10;Faster delivery&#10;Monthly coupon"
                data-ocid="admin.engagement.level_perks_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditLevel(null)}
              data-ocid="admin.engagement.level_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveLevel}
              data-ocid="admin.engagement.level_confirm_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
