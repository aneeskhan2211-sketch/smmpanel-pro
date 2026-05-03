import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  Gift,
  Globe,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Services", href: "/admin/services", icon: ShoppingBag },
  { label: "Pricing", href: "/admin/pricing", icon: TrendingUp },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Engagement", href: "/admin/engagement", icon: Gift },
  { label: "Translations", href: "/admin/translations", icon: Globe },
  { label: "Providers", href: "/admin/providers", icon: Database },
  { label: "Fraud Detection", href: "/admin/fraud", icon: AlertTriangle },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    toggleSidebarCollapsed,
  } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href);

  const handleNavClick = (href: string) => {
    navigate({ to: href });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

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

      {/* Admin Sidebar */}
      <motion.aside
        data-ocid="admin.sidebar"
        animate={{
          width: sidebarCollapsed ? 64 : 220,
          x:
            sidebarOpen ||
            (typeof window !== "undefined" && window.innerWidth >= 1024)
              ? 0
              : -260,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden",
          "lg:sticky lg:translate-x-0",
        )}
        style={{ top: 64 }}
      >
        {/* Admin badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-3 mt-3 mb-1 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                Admin Mode
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 lg:hidden">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Admin
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-sidebar-accent transition-smooth"
            aria-label="Close admin sidebar"
            data-ocid="admin.sidebar.close_button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav
          className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto"
          aria-label="Admin navigation"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <motion.button
                key={item.href}
                whileHover={{ x: active ? 0 : 2 }}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                  active
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
                data-ocid={`admin.sidebar.${item.label.toLowerCase().replace(" ", "_")}_link`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="px-2 pb-2 border-t border-sidebar-border pt-2">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-smooth group"
            data-ocid="admin.sidebar.back_to_app_link"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  Back to App
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:flex px-2 pb-4">
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-smooth text-xs"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            data-ocid="admin.sidebar.collapse_toggle"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
