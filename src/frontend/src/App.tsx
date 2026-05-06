import { AdminLayout } from "@/components/AdminLayout";
import { Layout } from "@/components/Layout";
import { AIToolsPage } from "@/pages/AIToolsPage";
import { ApiPage } from "@/pages/ApiPage";
import { BundlesPage } from "@/pages/BundlesPage";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { NewOrderPage } from "@/pages/NewOrderPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { SupportPage } from "@/pages/SupportPage";
import { WalletPage } from "@/pages/WalletPage";
import { AdminCouponsPage } from "@/pages/admin/AdminCouponsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminEngagementPage } from "@/pages/admin/AdminEngagementPage";
import { AdminFraudPage } from "@/pages/admin/AdminFraudPage";
import { AdminLogsPage } from "@/pages/admin/AdminLogsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminPricingPage } from "@/pages/admin/AdminPricingPage";
import { AdminProvidersPage } from "@/pages/admin/AdminProvidersPage";
import { AdminServicesPage } from "@/pages/admin/AdminServicesPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminTranslationsPage } from "@/pages/admin/AdminTranslationsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

const PaymentSuccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-sm space-y-4">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
        <svg
          role="img"
          aria-label="Success"
          className="w-8 h-8 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground">
        Payment Successful!
      </h2>
      <p className="text-muted-foreground">
        Your wallet has been credited. Start ordering now.
      </p>
      <a
        href="/wallet"
        className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold mt-2"
      >
        Go to Wallet
      </a>
    </div>
  </div>
);

const PaymentFailure = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-sm space-y-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <svg
          role="img"
          aria-label="Failure"
          className="w-8 h-8 text-destructive-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground">
        Payment Failed
      </h2>
      <p className="text-muted-foreground">
        Your payment was not completed. Please try again.
      </p>
      <a
        href="/wallet"
        className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold mt-2"
      >
        Back to Wallet
      </a>
    </div>
  </div>
);

// ApiPage imported from @/pages/ApiPage

// SupportPage is now imported from @/pages/SupportPage

// SettingsPage imported from @/pages/SettingsPage

function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/" });
  }
}

function requireAdmin() {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/" });
  }
  if (user?.role !== "admin") {
    throw redirect({ to: "/dashboard" });
  }
}

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: requireAuth,
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/services",
  component: ServicesPage,
});

const newOrderRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/new-order",
  component: NewOrderPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/orders/$orderId",
  component: OrderDetailPage,
});

const walletRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/wallet",
  component: WalletPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/subscriptions",
  component: SubscriptionsPage,
});

const apiRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/api",
  component: ApiPage,
});

const supportRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/support",
  component: SupportPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const bundlesRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/bundles",
  component: BundlesPage,
});

const calculatorRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/calculator",
  component: CalculatorPage,
});

const aiToolsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/ai-tools",
  component: AIToolsPage,
});

// Admin routes
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  beforeLoad: requireAdmin,
  component: AdminLayout,
});

const adminRedirectRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate({ to: "/admin/dashboard" });
    }, [navigate]);
    return null;
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/orders",
  component: AdminOrdersPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

const adminServicesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/services",
  component: AdminServicesPage,
});

const adminProvidersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/providers",
  component: AdminProvidersPage,
});

const adminFraudRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/fraud",
  component: AdminFraudPage,
});

const adminLogsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/logs",
  component: AdminLogsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

const adminPricingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/pricing",
  component: AdminPricingPage,
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/coupons",
  component: AdminCouponsPage,
});

const adminEngagementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/engagement",
  component: AdminEngagementPage,
});

const adminTranslationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/translations",
  component: AdminTranslationsPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    servicesRoute,
    newOrderRoute,
    ordersRoute,
    orderDetailRoute,
    walletRoute,
    subscriptionsRoute,
    apiRoute,
    supportRoute,
    settingsRoute,
    bundlesRoute,
    calculatorRoute,
    aiToolsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminRedirectRoute,
    adminDashboardRoute,
    adminOrdersRoute,
    adminUsersRoute,
    adminServicesRoute,
    adminProvidersRoute,
    adminFraudRoute,
    adminLogsRoute,
    adminSettingsRoute,
    adminPricingRoute,
    adminCouponsRoute,
    adminEngagementRoute,
    adminTranslationsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function ThemeSync() {
  const { theme } = useUIStore();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("smm-theme", theme);
    } catch (_) {
      /* ignore */
    }
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
    </>
  );
}
