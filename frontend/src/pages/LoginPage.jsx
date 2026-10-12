import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card-surface p-4 p-md-5 auth-card">
        <div className="text-center mb-4">
          <i className="fa-solid fa-store text-brand fs-1" />
          <h4 className="fw-bold mt-2">تسجيل الدخول</h4>
          <p className="text-muted small">اهلًا بيك تاني في دُكّان</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">كلمة المرور</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-brand w-100" disabled={submitting}>
            {submitting ? <span className="spinner-border spinner-border-sm" /> : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center small text-muted mt-4 mb-0">
          مالكش حساب؟ <Link to="/register" className="fw-semibold">أنشئ حساب جديد</Link>
        </p>
      </div>
    </div>
  );
}
