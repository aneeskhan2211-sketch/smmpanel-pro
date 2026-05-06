import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Calculator,
  ChevronRight,
  ClipboardList,
  Code2,
  CreditCard,
  HeadphonesIcon,
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  Shield,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  glow: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.45)",
  },
  {
    label: "New Order",
    href: "/new-order",
    icon: PlusCircle,
    color: "#22C55E",
    glow: "rgba(34,197,94,0.45)",
  },
  {
    label: "Services",
    href: "/services",
    icon: ShoppingBag,
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.45)",
  },
  {
    label: "Bundles",
    href: "/bundles",
    icon: Package,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.45)",
  },
  {
    label: "Calculator",
    href: "/calculator",
    icon: Calculator,
    color: "#06B6D4",
    glow: "rgba(6,182,212,0.45)",
  },
  {
    label: "AI Tools",
    href: "/ai-tools",
    icon: Bot,
    color: "#EC4899",
    glow: "rgba(236,72,153,0.45)",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ClipboardList,
    color: "#F97316",
    glow: "rgba(249,115,22,0.45)",
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.45)",
  },
  {
    label: "API",
    href: "/api",
    icon: Code2,
    color: "#10B981",
    glow: "rgba(16,185,129,0.45)",
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.45)",
  },
  {
    label: "Support",
    href: "/support",
    icon: HeadphonesIcon,
    color: "#34D399",
    glow: "rgba(52,211,153,0.45)",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    color: "#94A3B8",
    glow: "rgba(148,163,184,0.45)",
  },
];

const ADMIN_NAV: NavItem = {
  label: "Admin Panel",
  href: "/admin/dashboard",
  icon: Shield,
  color: "#FB7185",
  glow: "rgba(251,113,133,0.45)",
};

function NavButton({
  item,
  active,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (href: string) => void;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const [iconKey, setIconKey] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setIconKey((k) => k + 1);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500);
    onNavigate(item.href);
  };

  return (
    <div
      className="relative flex items-center w-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Active left accent bar */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="accent-bar"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              duration: 0.3,
            }}
            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
            style={{ background: item.color, transformOrigin: "top" }}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: active ? 1 : 1.05 }}
        whileTap={{ scale: 0.88 }}
        onClick={handleClick}
        className={cn(
          "relative flex items-center rounded-xl transition-all duration-200 overflow-hidden group",
          collapsed
            ? "w-11 h-11 justify-center mx-auto"
            : "w-full h-11 px-3 gap-3",
          active ? "" : "hover:bg-white/5",
        )}
        style={{
          background: active ? `${item.color}22` : undefined,
          boxShadow: active
            ? `0 0 16px ${item.glow}, inset 0 0 0 1px ${item.color}40`
            : undefined,
        }}
        data-ocid={`sidebar.${item.label.toLowerCase().replace(/\s+/g, "_")}_link`}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        type="button"
      >
        {/* Click ripple overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.span
              key="ripple"
              initial={{ opacity: 0.6, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ background: `${item.color}40` }}
            />
          )}
        </AnimatePresence>

        {/* Icon with bounce on click */}
        <motion.div
          key={iconKey}
          animate={
            iconKey > 0
              ? { rotate: [0, -14, 12, -6, 0], scale: [1, 1.15, 1] }
              : {}
          }
          transition={{ duration: 0.38, ease: "easeInOut" }}
          className="relative z-10 flex-shrink-0"
        >
          <Icon
            className="h-[20px] w-[20px] transition-all duration-200"
            style={{
              color: item.color,
              filter: active ? `drop-shadow(0 0 6px ${item.glow})` : undefined,
            }}
          />
        </motion.div>

        {/* White label — visible only when expanded */}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 text-sm font-medium leading-none truncate min-w-0"
              style={{
                color: active ? item.color : "#FFFFFF",
                textShadow: active ? `0 0 8px ${item.glow}` : undefined,
              }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover glow bg */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: `radial-gradient(circle at left center, ${item.color}18 0%, transparent 70%)`,
          }}
        />
      </motion.button>

      {/* Tooltip — only when sidebar is collapsed */}
      <AnimatePresence>
        {showTooltip && collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.94 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-3 z-[100] pointer-events-none"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl"
              style={{
                background: "#1a1f2e",
                border: `1px solid ${item.color}50`,
                color: item.color,
                boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 10px ${item.glow}`,
              }}
            >
              {item.label}
              <span
                className="absolute right-full top-1/2 -translate-y-1/2"
                style={{
                  borderWidth: "5px 5px 5px 0",
                  borderStyle: "solid",
                  borderColor: `transparent ${item.color}50 transparent transparent`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebarCollapsed,
  } = useUIStore();
  const { isAdmin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-fade (desktop only)
  const [isFaded, setIsFaded] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const resetFadeTimer = useCallback(() => {
    if (isMobile) return;
    setIsFaded(false);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => setIsFaded(true), 5000);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    resetFadeTimer();
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [resetFadeTimer, isMobile]);

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? location.pathname.startsWith("/admin")
      : location.pathname === href;

  const handleNavClick = (href: string) => {
    navigate({ to: href });
    resetFadeTimer();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const SIDEBAR_W = sidebarCollapsed ? 68 : 210;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        data-ocid="sidebar"
        animate={{
          width: SIDEBAR_W,
          x:
            sidebarOpen ||
            (typeof window !== "undefined" && window.innerWidth >= 1024)
              ? 0
              : -SIDEBAR_W - 10,
          opacity: !isMobile && isFaded ? 0.35 : 1,
        }}
        transition={{
          width: { type: "spring", stiffness: 300, damping: 30 },
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.5, ease: "easeInOut" },
        }}
        onMouseEnter={resetFadeTimer}
        onMouseMove={resetFadeTimer}
        className={cn(
          "fixed left-0 bottom-0 z-40 flex flex-col overflow-hidden",
          "lg:sticky lg:translate-x-0",
        )}
        style={{
          top: 64,
          background:
            "linear-gradient(180deg, #0d1117 0%, #0B0F19 50%, #0d1117 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-end px-2 pt-3 pb-1 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Colorful dot strip at top */}
        <div
          className={cn(
            "flex pt-3 pb-2",
            sidebarCollapsed ? "justify-center" : "justify-start px-4",
          )}
        >
          <div className="flex gap-[3px]">
            {["#3B82F6", "#22C55E", "#EC4899", "#F59E0B"].map((c) => (
              <span
                key={c}
                className="block w-1 h-1 rounded-full opacity-70"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Nav items */}
        <nav
          className="flex-1 flex flex-col gap-1 px-2 py-2 overflow-y-auto"
          aria-label="Main navigation"
          onMouseEnter={resetFadeTimer}
        >
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onNavigate={handleNavClick}
              collapsed={sidebarCollapsed}
            />
          ))}

          {/* Divider */}
          {isAdmin && (
            <div
              className="my-1.5 mx-2"
              style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
            />
          )}

          {/* Admin nav */}
          {isAdmin && (
            <NavButton
              key={ADMIN_NAV.href}
              item={ADMIN_NAV}
              active={isActive(ADMIN_NAV.href)}
              onNavigate={handleNavClick}
              collapsed={sidebarCollapsed}
            />
          )}
        </nav>

        {/* Bottom collapse button (desktop) */}
        <div className="hidden lg:flex flex-col items-center pb-4 pt-2">
          <div
            className="w-8"
            style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}
          />
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            data-ocid="sidebar.collapse_toggle_bottom"
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: "#94A3B8" }} />
            </motion.div>
          </button>
        </div>
      </motion.aside>

      {/* Floating collapse arrow toggle (desktop only) */}
      <div
        className="hidden lg:block fixed z-50 pointer-events-none"
        style={{ top: "calc(64px + 50vh - 14px)", left: SIDEBAR_W }}
      >
        <motion.button
          type="button"
          onClick={toggleSidebarCollapsed}
          animate={{ x: "-50%" }}
          whileHover={{
            scale: 1.15,
            boxShadow: "0 0 16px rgba(59,130,246,0.5)",
          }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: "#0d1117",
            border: "1px solid rgba(59,130,246,0.4)",
            boxShadow:
              "0 0 8px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.5)",
          }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-ocid="sidebar.collapse_toggle"
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <ChevronRight
              className="h-3.5 w-3.5"
              style={{ color: "#3B82F6" }}
            />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
