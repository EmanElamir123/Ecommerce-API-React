import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// بيمنع أي حد مش مسجل دخول من الوصول للصفحة، ويرجّعه لصفحة تسجيل الدخول
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
