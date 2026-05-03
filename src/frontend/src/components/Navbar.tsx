import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useCurrencyStore } from "@/store/currencyStore";
import { useLanguageStore } from "@/store/languageStore";
import { useUIStore } from "@/store/uiStore";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, Menu, Moon, Plus, Search, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar, searchQuery, setSearchQuery } =
    useUIStore();
  const navigate = useNavigate();
  const [notifCount] = useState(3);
  const { selectedCurrency, currencies, setCurrency } = useCurrencyStore();
  const { language, setLanguage } = useLanguageStore();
  useCurrencies();

  const LANGUAGES = [
    { code: "en" as const, label: "EN", name: "English" },
    { code: "ar" as const, label: "AR", name: "Arabic" },
    { code: "hi" as const, label: "HI", name: "Hindi" },
    { code: "hinglish" as const, label: "HG", name: "Hinglish" },
  ];

  const walletDisplay = user ? `$${user.walletBalance.toFixed(2)}` : "$0.00";

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header
      className="sticky top-0 z-50 h-16 bg-card border-b border-border shadow-subtle flex items-center px-4 gap-3"
      data-ocid="navbar"
    >
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        data-ocid="navbar.sidebar_toggle"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <button
        type="button"
        className="hidden lg:flex items-center gap-2 shrink-0 cursor-pointer bg-transparent border-0 p-0"
        onClick={() => navigate({ to: "/dashboard" })}
        data-ocid="navbar.logo"
        aria-label="Go to dashboard"
      >
        <img
          src="/assets/generated/smm-logo-icon-transparent.dim_64x64.png"
          alt="SMMPanel logo"
          className="h-7 w-7"
        />
        <span className="font-display font-bold text-lg text-foreground tracking-tight">
          Boost<span className="text-primary">Panel</span>
        </span>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto" data-ocid="navbar.search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9 bg-background border-border focus:border-primary transition-smooth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-ocid="navbar.search_input"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Wallet */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate({ to: "/wallet" })}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium transition-smooth hover:bg-primary/20"
          data-ocid="navbar.wallet_balance"
        >
          <span>💳</span>
          <span>{walletDisplay}</span>
        </motion.button>

        {/* Add Funds */}
        <Button
          size="sm"
          className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => navigate({ to: "/wallet" })}
          data-ocid="navbar.add_funds_button"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Funds</span>
        </Button>

        {/* Currency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              data-ocid="navbar.currency_selector"
            >
              <span>{selectedCurrency.flag}</span>
              <span>{selectedCurrency.code}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {currencies.map((c) => (
              <DropdownMenuItem
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={
                  c.code === selectedCurrency.code
                    ? "text-primary font-semibold"
                    : ""
                }
                data-ocid={`navbar.currency_${c.code.toLowerCase()}`}
              >
                <span className="mr-2">{c.flag}</span>
                {c.symbol} {c.code} — {c.displayName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              data-ocid="navbar.language_selector"
            >
              <span>
                {LANGUAGES.find((l) => l.code === language)?.label ?? "EN"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={
                  l.code === language ? "text-primary font-semibold" : ""
                }
                data-ocid={`navbar.lang_${l.code}`}
              >
                {l.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <div className="relative" data-ocid="navbar.notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                {notifCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          data-ocid="navbar.theme_toggle"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              data-ocid="navbar.profile_button"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
                {user?.username ?? "Guest"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            data-ocid="navbar.profile_dropdown"
          >
            <DropdownMenuItem
              onClick={() => navigate({ to: "/settings" })}
              data-ocid="navbar.settings_link"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate({ to: "/api" })}
              data-ocid="navbar.api_link"
            >
              API Access
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
              data-ocid="navbar.logout_button"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
