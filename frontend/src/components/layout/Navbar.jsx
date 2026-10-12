import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isBackOffice, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : "/products");
  };

  return (
    <nav className="navbar navbar-expand-lg brand-navbar sticky-top py-2">
      <div className="container">
        <Link to="/" className="brand-logo navbar-brand">
          <i className="fa-solid fa-store" />
          دُكّان
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <i className="fa-solid fa-bars" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link nav-link-brand" to="/">
                الرئيسية
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-link-brand" to="/products">
                المنتجات
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-link-brand" to="/track-order">
                تتبع طلبك
              </Link>
            </li>
            {isBackOffice && (
              <li className="nav-item">
                <Link className="nav-link nav-link-brand" to="/admin">
                  <i className="fa-solid fa-gauge-high me-1" />
                  لوحة التحكم
                </Link>
              </li>
            )}
          </ul>

          <form className="d-flex me-lg-3 mb-2 mb-lg-0" onSubmit={handleSearch} role="search">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa-solid fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="position-relative text-reset fs-5" title="السلة">
              <i className="fa-solid fa-cart-shopping" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-brand btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fa-solid fa-user me-1" />
                  {user?.firstName || "حسابي"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fa-solid fa-id-card me-2" /> الملف الشخصي
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      <i className="fa-solid fa-bag-shopping me-2" /> طلباتي
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        <i className="fa-solid fa-gauge-high me-2" /> لوحة التحكم
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => { logout(); navigate("/"); }}>
                      <i className="fa-solid fa-arrow-right-from-bracket me-2" /> تسجيل الخروج
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-brand btn-sm">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
