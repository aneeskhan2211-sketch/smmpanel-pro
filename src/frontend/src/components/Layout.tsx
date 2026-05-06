import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="layout"
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto bg-background"
          style={{
            transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            minWidth: 0,
          }}
          data-ocid="layout.main_content"
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
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
