import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { RedesignedHomePage as HomePage } from "../pages/RedesignedHomePage";

export function PublicHomeGate() {
  const { user } = useAuth();

  if (user) {
    if (user.roles.includes("admin")) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <HomePage />;
}
