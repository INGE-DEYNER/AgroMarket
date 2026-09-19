import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/hooks/useAuth";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload?.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children, roles, permissions }) {
  const { user, loading, logout } = useAuth();
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (token && isTokenExpired(token)) logout();
  }, [token, logout]);

  if (loading) return <div style={{display:"grid",placeItems:"center",minHeight:"100vh"}}>Cargando...</div>;

  if (!user || (token && isTokenExpired(token))) {
    return <Navigate to={`/login?message=expired&from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles?.length) {
    const normalized = String(user.role || "").toLowerCase();
    const allowed = roles.some((role) => String(role).toLowerCase() === normalized);
    if (!allowed) return <Navigate to="/estado/403" replace state={{ from: location.pathname }} />;
  }

  if (permissions?.length) {
    const granted = Array.isArray(user.permissions) ? user.permissions : [];
    const allowed = permissions.every((permission) => granted.includes(permission));
    if (!allowed) return <Navigate to="/estado/403" replace state={{ from: location.pathname }} />;
  }

  return children;
}
