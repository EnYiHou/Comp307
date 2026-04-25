import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../../components/loading/LoadingState.jsx";
import { useAuth } from "../../features/auth/useAuth.js";

export default function ProtectedRoute({ allowedRoles, redirectTo = "/dashboard" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Loading your workspace..." variant="page" size="large" />;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
