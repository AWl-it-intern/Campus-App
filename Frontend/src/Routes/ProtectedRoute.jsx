import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({
  children,
  storageKey = "candidate_auth",
  redirectTo = "/login",
}) {
  const isAuthenticated = localStorage.getItem(storageKey) === "true";

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children || <Outlet />;
}
