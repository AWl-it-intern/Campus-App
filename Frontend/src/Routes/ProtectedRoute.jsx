import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("candidate_auth");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
