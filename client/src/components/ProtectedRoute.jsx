import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="panel">Loading Campus Connect...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
