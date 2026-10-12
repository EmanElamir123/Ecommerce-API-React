import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "الرئيسية", icon: "fa-gauge-high", end: true, admin: false },
  { to: "/admin/products", label: "المنتجات", icon: "fa-boxes-stacked", admin: true },
  { to: "/admin/categories", label: "التصنيفات", icon: "fa-tags", admin: true },
  { to: "/admin/brands", label: "الماركات", icon: "fa-copyright", admin: true },
  { to: "/admin/featured", label: "المنتجات المميزة", icon: "fa-star", admin: true },
  { to: "/admin/orders", label: "بحث عن طلب", icon: "fa-magnifying-glass-dollar", admin: false },
  { to: "/admin/users", label: "المستخدمين", icon: "fa-users-gear", admin: true },
];

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const visibleLinks = links.filter((l) => !l.admin || isAdmin);

  return (
    <div className="admin-shell d-flex">
      <aside className="admin-sidebar p-3" style={{ width: 240, flexShrink: 0 }}>
        <h6 className="fw-bold text-brand mb-3 px-2">
          <i className="fa-solid fa-store me-2" /> لوحة التحكم
        </h6>
        <nav className="nav flex-column">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <i className={`fa-solid ${link.icon} me-2`} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}
