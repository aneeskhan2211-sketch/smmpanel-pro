import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Code2,
  HeadphonesIcon,
  LayoutDashboard,
  Package,
  PlusCircle,
  RefreshCw,
  Settings,
  Shield,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Order", href: "/new-order", icon: PlusCircle },
  { label: "Services", href: "/services", icon: ShoppingBag },
  { label: "Bundles", href: "/bundles", icon: Package },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "AI Tools", href: "/ai-tools", icon: Bot },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
  { label: "API", href: "/api", icon: Code2 },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Support", href: "/support", icon: HeadphonesIcon },
  { label: "Settings", href: "/settings", icon: Settings },
];

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

  const isActive = (href: string) => location.pathname === href;

  const handleNavClick = (href: string) => {
    navigate({ to: href });
    // Close mobile drawer
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
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

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        <motion.aside
          data-ocid="sidebar"
          animate={{
            width: sidebarCollapsed ? 64 : 220,
            x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -260,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden",
            "lg:sticky lg:translate-x-0",
          )}
          style={{ top: 64 }}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1 lg:hidden">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-sidebar-accent transition-smooth"
              aria-label="Close sidebar"
              data-ocid="sidebar.close_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <nav
            className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
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
                  data-ocid={`sidebar.${item.label.toLowerCase().replace(" ", "_")}_link`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0",
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

          {/* Admin panel link (admin only) */}
          {isAdmin && (
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => handleNavClick("/admin/dashboard")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                location.pathname.startsWith("/admin")
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              data-ocid="sidebar.admin_panel_link"
            >
              <Shield
                className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  location.pathname.startsWith("/admin")
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
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex px-2 pb-4">
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-smooth text-xs"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              data-ocid="sidebar.collapse_toggle"
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
      </AnimatePresence>
    </>
  );
}
