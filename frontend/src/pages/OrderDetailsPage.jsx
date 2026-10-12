import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../api/orders";
import { formatDateTime, formatPrice } from "../utils/formatters";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="container py-5">
        <EmptyState icon="fa-file-circle-question" title="الطلب غير موجود" subtitle="اتأكد من رقم الطلب أو إنه ليك." />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/orders" className="small text-muted d-inline-block mb-3">
        <i className="fa-solid fa-arrow-right me-1" /> الرجوع لطلباتي
      </Link>

      <div className="card-surface p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h4 className="fw-bold mb-1">طلب رقم #{order.orderId}</h4>
            <span className="text-muted small">{formatDateTime(order.creationDate)}</span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="row g-3 text-muted small border-top pt-3">
          <div className="col-md-4">
            <i className="fa-solid fa-truck me-2 text-brand" />
            طريقة الاستلام: {order.distributionChannel}
          </div>
          <div className="col-md-4">
            <i className="fa-solid fa-credit-card me-2 text-brand" />
            الدفع: {order.paymentType}
          </div>
          {order.deliveryDate && (
            <div className="col-md-4">
              <i className="fa-solid fa-calendar-check me-2 text-brand" />
              تاريخ التسليم المتوقع: {formatDateTime(order.deliveryDate)}
            </div>
          )}
        </div>
      </div>

      <div className="card-surface p-4">
        <h6 className="fw-bold mb-3">المنتجات</h6>
        {order.items?.map((item) => (
          <div key={item.productId} className="d-flex align-items-center gap-3 py-2 border-bottom">
            <div className="rounded-3 bg-light overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="w-100 h-100" style={{ objectFit: "cover" }} />
              ) : (
                <i className="fa-solid fa-image text-secondary opacity-50" />
              )}
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold">{item.productName}</div>
              <span className="text-muted small">{item.quantity} × {formatPrice(item.unitPrice)}</span>
            </div>
            <div className="fw-bold">{formatPrice(item.quantity * item.unitPrice)}</div>
          </div>
        ))}
        <div className="d-flex justify-content-between fw-bold fs-5 pt-3">
          <span>الإجمالي</span>
          <span className="text-brand">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
