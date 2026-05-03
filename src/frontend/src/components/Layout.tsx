import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const { theme, sidebarCollapsed } = useUIStore();

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="layout"
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300 bg-background",
            "lg:ml-0",
          )}
          data-ocid="layout.main_content"
        >
          <div
            className={cn(
              "max-w-screen-xl mx-auto px-4 sm:px-6 py-6",
              sidebarCollapsed ? "lg:pl-4" : "lg:pl-4",
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-4 px-6 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-smooth"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
