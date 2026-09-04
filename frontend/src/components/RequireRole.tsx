import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export function RequireRole({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If no user, redirect to login
  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
      replace: true,
    });
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
