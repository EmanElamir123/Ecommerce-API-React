import { useLocation, useParams, Link } from "react-router-dom";
import { useState } from "react";
import { formatPrice } from "../utils/formatters";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const { order, guestTrackingToken } = location.state || {};
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(guestTrackingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <i className="fa-solid fa-circle-check text-success" style={{ fontSize: "4rem" }} />
        <h3 className="fw-bold mt-3">تم استلام طلبك بنجاح!</h3>
        <p className="text-muted">رقم الطلب هو #{id}</p>
      </div>

      {guestTrackingToken && (
        <div className="alert alert-warning mx-auto" style={{ maxWidth: 640 }}>
          <i className="fa-solid fa-triangle-exclamation me-2" />
          احتفظ بكود التتبع ده عشان تقدر تتابع طلبك بدون تسجيل دخول:
          <div className="d-flex align-items-center gap-2 mt-2">
            <code className="bg-white px-2 py-1 rounded flex-grow-1 text-break">{guestTrackingToken}</code>
            <button className="btn btn-sm btn-outline-brand" onClick={handleCopyToken}>
              {copied ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-copy" />}
            </button>
          </div>
        </div>
      )}

      {order && (
        <div className="card-surface p-4 mx-auto mt-4" style={{ maxWidth: 640 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">تفاصيل الطلب</h6>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.items?.map((item) => (
            <div key={item.productId} className="d-flex justify-content-between small py-2 border-bottom">
              <span>{item.productName} × {item.quantity}</span>
              <span className="fw-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="d-flex justify-content-between fw-bold fs-5 pt-3">
            <span>الإجمالي</span>
            <span className="text-brand">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to="/products" className="btn btn-outline-brand">متابعة التسوق</Link>
        <Link to={`/track-order`} className="btn btn-brand">تتبع الطلب</Link>
      </div>
    </div>
  );
}
