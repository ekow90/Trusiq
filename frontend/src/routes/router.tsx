import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { PublicHomeGate } from "./PublicHomeGate";
import { SearchPage } from "../pages/SearchPage";
import TrendsPage from "../pages/TrendsPage";
import MapPage from "../pages/MapPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { LoginPage } from "../pages/LoginPage";
import { BusinessProfilePage } from "../pages/BusinessProfilePage";
import { DashboardPage } from "../pages/DashboardPage";
import { AdminPanel } from "../pages/AdminPanel";
import { TrustScorePage } from "../pages/TrustScorePage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { VerificationPage } from "../pages/VerificationPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { ReportScamPage } from "../pages/ReportScamPage";
import { CustomerActivityPage } from "../pages/CustomerActivityPage";
import ReviewPage from "../pages/ReviewPage";
import RequireRole from "../components/RequireRole";
import BusinessQrPage from "../pages/BusinessQrPage";
import { SettingsPage } from "../pages/SettingsPage";
import AdminLoginPage from "../pages/AdminLoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <PublicHomeGate />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "trends",
        element: <TrendsPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "review",
        element: (
          <RequireRole allowedRoles={["customer"]}>
            <ReviewPage />
          </RequireRole>
        ),
      },
      {
        path: "business/:slug",
        element: <BusinessProfilePage />,
      },
      {
        path: "business/:slug/qr",
        element: <BusinessQrPage />,
      },
      {
        path: "register",
        element: <RegistrationPage />,
      },
      {
        path: "trust-score",
        element: (
          <RequireRole allowedRoles={["admin", "owner"]}>
            <TrustScorePage />
          </RequireRole>
        ),
      },
      {
        path: "dashboard",
        element: (
          <RequireRole allowedRoles={["owner", "customer"]}>
            <DashboardPage />
          </RequireRole>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireRole allowedRoles={["customer", "owner", "admin"]}>
            <SettingsPage />
          </RequireRole>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <AdminPanel />
          </RequireRole>
        ),
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin-login",
        element: <AdminLoginPage />,
      },
      {
        path: "verification",
        element: (
          <RequireRole allowedRoles={["owner"]}>
            <VerificationPage />
          </RequireRole>
        ),
      },
      {
        path: "notifications",
        element: (
          <RequireRole allowedRoles={["customer", "owner", "admin"]}>
            <NotificationsPage />
          </RequireRole>
        ),
      },
      {
        path: "report-scam",
        element: (
          <RequireRole allowedRoles={["customer"]}>
            <ReportScamPage />
          </RequireRole>
        ),
      },
      {
        path: "activity",
        element: (
          <RequireRole allowedRoles={["customer"]}>
            <CustomerActivityPage />
          </RequireRole>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
