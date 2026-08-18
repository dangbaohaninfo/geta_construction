import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import type { Role } from "../lib/types";

export default function ProtectedRoute({ requiredRole }: { requiredRole?: Role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/transactions" replace />;

  return <Outlet />;
}
