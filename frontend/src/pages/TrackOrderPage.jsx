import { useState } from "react";
import { trackGuestOrder } from "../api/orders";
import { extractErrorMessage } from "../api/client";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await trackGuestOrder(orderId, token);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err) || "مقدرناش نلاقي طلب بالبيانات دي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card-surface p-4 p-md-5 mx-auto" style={{ maxWidth: 560 }}>
        <div className="text-center mb-4">
          <i className="fa-solid fa-truck-fast text-brand fs-1" />
          <h4 className="fw-bold mt-2">تتبع طلبك</h4>
          <p className="text-muted small">
            دخّل رقم الطلب وكود التتبع اللي استلمته بعد إتمام الشراء كضيف.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">رقم الطلب</label>
            <input className="form-control" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">كود التتبع</label>
            <input className="form-control" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-brand w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : "تتبع الطلب"}
          </button>
        </form>

        {error && <div className="alert alert-danger py-2 small mt-3 mb-0">{error}</div>}

        {result && (
          <div className="mt-4 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">طلب رقم #{result.orderId}</span>
              <OrderStatusBadge status={result.status} />
            </div>
            {result.acceptedText && <p className="text-muted small">{result.acceptedText}</p>}
            {result.nextStatuses?.length > 0 && (
              <p className="small text-muted mb-0">
                الخطوة الجاية: {result.nextStatuses.join(" أو ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
