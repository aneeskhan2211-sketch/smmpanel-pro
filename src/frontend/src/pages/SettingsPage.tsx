import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationPrefs } from "@/hooks/useSettings";
import { useSettings } from "@/hooks/useSettings";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, isSavingProfile, saveProfile } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { username: user?.username ?? "", email: user?.email ?? "" },
  });

  const initials = (user?.username ?? "U")
    .split("_")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onSubmit = handleSubmit(async (data) => {
    await saveProfile(data);
    toast.success("Profile updated successfully");
  });

  return (
    <motion.form
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className="space-y-8"
      data-ocid="settings.profile.form"
    >
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div
          className="relative group cursor-pointer"
          data-ocid="settings.avatar"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-display font-bold text-2xl select-none">
            {initials}
          </div>
          <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
            <Camera className="w-5 h-5 text-foreground" />
          </div>
        </div>
        <div>
          <p className="font-medium text-foreground">{user?.username}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click avatar to upload photo
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            data-ocid="settings.username.input"
            placeholder="Your username"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
            })}
            className="bg-secondary border-border focus:border-primary"
          />
          {errors.username && (
            <p
              className="text-xs text-destructive"
              data-ocid="settings.username.field_error"
            >
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">
            Email <span className="text-xs">(read-only)</span>
          </Label>
          <Input
            id="email"
            data-ocid="settings.email.input"
            readOnly
            disabled
            {...register("email")}
            className="bg-muted border-border text-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>

      <Button
        type="submit"
        data-ocid="settings.profile.submit_button"
        disabled={isSavingProfile}
        className="min-w-[140px]"
      >
        {isSavingProfile ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </motion.form>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const { isSavingPassword, changePassword } = useSettings();
  const [show, setShow] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPwValue = watch("newPassword");

  const onSubmit = handleSubmit(async (data) => {
    await changePassword(data);
    toast.success("Password changed successfully");
    reset();
  });

  const ToggleBtn = ({ field }: { field: keyof typeof show }) => (
    <button
      type="button"
      onClick={() => setShow((s) => ({ ...s, [field]: !s[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={show[field] ? "Hide password" : "Show password"}
    >
      {show[field] ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <motion.form
      key="security"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className="space-y-5 max-w-md"
      data-ocid="settings.security.form"
    >
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            data-ocid="settings.current_password.input"
            type={show.current ? "text" : "password"}
            placeholder="Enter current password"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            className="bg-secondary border-border focus:border-primary pr-10"
          />
          <ToggleBtn field="current" />
        </div>
        {errors.currentPassword && (
          <p
            className="text-xs text-destructive"
            data-ocid="settings.current_password.field_error"
          >
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            data-ocid="settings.new_password.input"
            type={show.newPw ? "text" : "password"}
            placeholder="Min 8 characters"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Minimum 8 characters required" },
            })}
            className="bg-secondary border-border focus:border-primary pr-10"
          />
          <ToggleBtn field="newPw" />
        </div>
        {errors.newPassword && (
          <p
            className="text-xs text-destructive"
            data-ocid="settings.new_password.field_error"
          >
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            data-ocid="settings.confirm_password.input"
            type={show.confirm ? "text" : "password"}
            placeholder="Repeat new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === newPwValue || "Passwords do not match",
            })}
            className="bg-secondary border-border focus:border-primary pr-10"
          />
          <ToggleBtn field="confirm" />
        </div>
        {errors.confirmPassword && (
          <p
            className="text-xs text-destructive"
            data-ocid="settings.confirm_password.field_error"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-ocid="settings.security.submit_button"
        disabled={isSavingPassword}
        className="min-w-[160px] mt-2"
      >
        {isSavingPassword ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </motion.form>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const { notifPrefs, isSavingNotifs, saveNotifications } = useSettings();
  const [local, setLocal] = useState<NotificationPrefs>(notifPrefs);

  const toggle = (key: keyof NotificationPrefs) =>
    setLocal((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    await saveNotifications(local);
    toast.success("Notification preferences saved");
  };

  const items: { key: keyof NotificationPrefs; label: string; desc: string }[] =
    [
      {
        key: "orderStatus",
        label: "Order Status Updates",
        desc: "Get notified when your order status changes",
      },
      {
        key: "walletAlerts",
        label: "Wallet Balance Alerts",
        desc: "Alerts when your balance is low or funds are added",
      },
      {
        key: "ticketReplies",
        label: "Support Ticket Replies",
        desc: "Notifications when an agent replies to your ticket",
      },
      {
        key: "promotionalOffers",
        label: "Promotional Offers",
        desc: "Special discounts and new service announcements",
      },
    ];

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
      data-ocid="settings.notifications.panel"
    >
      <div className="space-y-1">
        {items.map((item, i) => (
          <div
            key={item.key}
            data-ocid={`settings.notif.item.${i + 1}`}
            className="flex items-center justify-between py-4 border-b border-border last:border-0"
          >
            <div className="pr-6">
              <p className="font-medium text-foreground text-sm">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.desc}
              </p>
            </div>
            <Switch
              checked={local[item.key]}
              onCheckedChange={() => toggle(item.key)}
              data-ocid={`settings.notif.toggle.${i + 1}`}
              className="data-[state=checked]:bg-accent shrink-0"
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        data-ocid="settings.notifications.submit_button"
        disabled={isSavingNotifs}
        onClick={handleSave}
        className="min-w-[160px]"
      >
        {isSavingNotifs ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </motion.div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────
function ApiKeysTab() {
  const { user, isGeneratingKey, generateApiKey } = useSettings();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayKey = generatedKey ?? user?.apiKey;
  const keyCount = displayKey ? 1 : 0;

  const handleGenerate = async () => {
    const key = await generateApiKey();
    setGeneratedKey(key);
    toast.success("New API key generated");
  };

  const handleCopy = () => {
    if (displayKey) {
      navigator.clipboard.writeText(displayKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      key="apikeys"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
      data-ocid="settings.api_keys.panel"
    >
      {/* Summary */}
      <div className="flex items-start justify-between p-4 rounded-xl bg-secondary border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">API Keys</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {keyCount} active key{keyCount !== 1 ? "s" : ""} —{" "}
              <Link
                to="/api"
                data-ocid="settings.api_keys.full_page_link"
                className="text-primary hover:underline"
              >
                Manage all keys →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Current key display */}
      {displayKey && (
        <div className="space-y-2">
          <Label>Current Key</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              {displayKey}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-ocid="settings.api_key.copy_button"
              onClick={handleCopy}
              aria-label="Copy API key"
              className="shrink-0"
            >
              <Copy className={`w-4 h-4 ${copied ? "text-accent" : ""}`} />
            </Button>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          data-ocid="settings.api_key.generate_button"
          disabled={isGeneratingKey}
          onClick={handleGenerate}
          className="min-w-[180px] w-fit"
        >
          {isGeneratingKey ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Quick Key
            </>
          )}
        </Button>
        {displayKey && (
          <p className="text-xs text-muted-foreground">
            Generating a new key will invalidate the previous one.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { value: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { value: "security", label: "Security", icon: <Eye className="w-4 h-4" /> },
    {
      value: "notifications",
      label: "Notifications",
      icon: <Key className="w-4 h-4" />,
    },
    { value: "apikeys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div data-ocid="settings.page" className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and security
        </p>
      </div>

      {/* Card container */}
      <div className="rounded-2xl bg-card border border-border shadow-elevated overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab list */}
          <div className="border-b border-border px-6 pt-2">
            <TabsList
              className="bg-transparent p-0 h-auto gap-1"
              data-ocid="settings.tabs"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-ocid={`settings.tab.${tab.value}`}
                  className="relative px-4 py-3 text-sm font-medium text-muted-foreground rounded-none bg-transparent border-0 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <TabsContent
                value="profile"
                forceMount
                hidden={activeTab !== "profile"}
              >
                {activeTab === "profile" && <ProfileTab />}
              </TabsContent>
              <TabsContent
                value="security"
                forceMount
                hidden={activeTab !== "security"}
              >
                {activeTab === "security" && <SecurityTab />}
              </TabsContent>
              <TabsContent
                value="notifications"
                forceMount
                hidden={activeTab !== "notifications"}
              >
                {activeTab === "notifications" && <NotificationsTab />}
              </TabsContent>
              <TabsContent
                value="apikeys"
                forceMount
                hidden={activeTab !== "apikeys"}
              >
                {activeTab === "apikeys" && <ApiKeysTab />}
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
