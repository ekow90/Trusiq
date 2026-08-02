import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireRole({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If no user, redirect to login
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const ok = allowedRoles.some((r) => user.roles.includes(r));
  if (!ok) {
    // Show a simple unauthorized message route instead of navigating away
    navigate("/unauthorized", { replace: true });
    return null;
  }

  return children;
}

export default RequireRole;
