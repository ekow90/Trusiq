import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { RedesignedHomePage as HomePage } from "../pages/RedesignedHomePage";
import { SearchPage } from "../pages/SearchPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { LoginPage } from "../pages/LoginPage";
import { BusinessProfilePage } from "../pages/BusinessProfilePage";
import { TrustScorePage } from "../pages/TrustScorePage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import RequireRole from "../components/RequireRole";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "business/:slug",
        element: <BusinessProfilePage />,
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
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
