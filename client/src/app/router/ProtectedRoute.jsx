// EnYi Hou (261165635)

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth.js";

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/dashboard",
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
