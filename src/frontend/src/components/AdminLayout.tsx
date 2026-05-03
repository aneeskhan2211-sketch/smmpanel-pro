import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { ChevronRight, LogOut, Menu, Shield } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

function Breadcrumb() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Orders",
    users: "Users",
    services: "Services",
    providers: "Providers",
    fraud: "Fraud Detection",
    logs: "System Logs",
    settings: "Settings",
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">Admin</span>
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span
            className={
              i === segments.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }
          >
            {labels[seg] ?? seg}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="admin.layout"
    >
      {/* Admin Top Bar */}
      <header
        className="sticky top-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4 gap-4"
        data-ocid="admin.header"
      >
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin sidebar"
            data-ocid="admin.header.menu_button"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-foreground text-sm">
                SMMPanel Pro
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-primary font-semibold">
                  ADMIN PANEL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb (desktop) */}
        <div className="hidden md:block flex-1 px-4">
          <Breadcrumb />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.username?.slice(0, 1).toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="text-muted-foreground font-medium">
              {user?.username ?? "Admin"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
            data-ocid="admin.header.logout_button"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main
          className="flex-1 overflow-y-auto bg-background"
          data-ocid="admin.main_content"
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
            {/* Mobile breadcrumb */}
            <div className="md:hidden mb-4">
              <Breadcrumb />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
