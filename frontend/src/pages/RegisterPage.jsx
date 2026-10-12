import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

const emptyForm = { firstName: "", lastName: "", email: "", password: "", phone: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
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
          <i className="fa-solid fa-user-plus text-brand fs-1" />
          <h4 className="fw-bold mt-2">إنشاء حساب جديد</h4>
          <p className="text-muted small">انضم لعائلة دُكّان في ثواني</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold">الاسم الأول</label>
              <input className="form-control" value={form.firstName} onChange={update("firstName")} required />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">الاسم الأخير</label>
              <input className="form-control" value={form.lastName} onChange={update("lastName")} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">البريد الإلكتروني</label>
            <input type="email" className="form-control" value={form.email} onChange={update("email")} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">رقم الهاتف (اختياري)</label>
            <input className="form-control" value={form.phone} onChange={update("phone")} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">كلمة المرور</label>
            <input type="password" className="form-control" value={form.password} onChange={update("password")} required />
          </div>
          <button type="submit" className="btn btn-brand w-100" disabled={submitting}>
            {submitting ? <span className="spinner-border spinner-border-sm" /> : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center small text-muted mt-4 mb-0">
          عندك حساب بالفعل؟ <Link to="/login" className="fw-semibold">سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}
