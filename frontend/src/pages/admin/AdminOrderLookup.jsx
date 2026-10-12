import { useState } from "react";
import { toast } from "react-toastify";
import { getOrder, advanceOrderStatus } from "../../api/orders";
import { extractErrorMessage } from "../../api/client";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge";

export default function AdminOrderLookup() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    setError("");
    setLoading(true);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(extractErrorMessage(err) || "مقدرناش نلاقي الطلب ده.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      await advanceOrderStatus(order.orderId, null);
      toast.success("تم تحديث حالة الطلب");
      const refreshed = await getOrder(order.orderId);
      setOrder(refreshed);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="fa-solid fa-magnifying-glass-dollar me-2 text-brand" /> البحث عن طلب
      </h4>

      <form className="d-flex gap-2 mb-4" style={{ maxWidth: 360 }} onSubmit={handleSearch}>
        <input className="form-control" placeholder="رقم الطلب" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <button className="btn btn-brand" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm" /> : "بحث"}
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {order && (
        <div className="card-surface p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h6 className="fw-bold mb-1">طلب رقم #{order.orderId}</h6>
              <span className="text-muted small">{formatDateTime(order.creationDate)}</span>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="row g-3 text-muted small border-top border-bottom py-3 mb-3">
            <div className="col-md-4">طريقة الاستلام: {order.distributionChannel}</div>
            <div className="col-md-4">الدفع: {order.paymentType}</div>
            <div className="col-md-4">الإجمالي: <span className="fw-bold text-brand">{formatPrice(order.total)}</span></div>
          </div>

          {order.items?.map((item) => (
            <div key={item.productId} className="d-flex justify-content-between small py-2 border-bottom">
              <span>{item.productName} × {item.quantity}</span>
              <span className="fw-semibold">{formatPrice(item.quantity * item.unitPrice)}</span>
            </div>
          ))}

          <button className="btn btn-brand mt-3" onClick={handleAdvance} disabled={advancing}>
            {advancing ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fa-solid fa-forward me-2" />}
            تقديم الطلب للحالة الجاية
          </button>
        </div>
      )}
    </div>
  );
}
