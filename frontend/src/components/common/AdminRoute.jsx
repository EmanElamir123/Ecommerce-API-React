import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import EmptyState from "./EmptyState";

/**
 * بيسمح فقط للمستخدمين اللي معاهم صلاحية Admin أو BackOffice بالدخول.
 * requireAdmin=true معناها لازم يكون Admin بالظبط (زي إدارة المنتجات)،
 * وإلا بيكفي إنه من فريق الـ BackOffice (زي الداشبورد).
 */
export default function AdminRoute({ children, requireAdmin = true }) {
  const { isAuthenticated, isAdmin, isBackOffice } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const allowed = requireAdmin ? isAdmin : isBackOffice;
  if (!allowed) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="fa-lock"
          title="مفيش صلاحية للدخول هنا"
          subtitle="الصفحة دي مخصصة لفريق إدارة المتجر بس."
        />
      </div>
    );
  }
  return children;
}
