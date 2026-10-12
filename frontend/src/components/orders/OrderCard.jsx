import { Link } from "react-router-dom";
import { formatDate, formatPrice } from "../../utils/formatters";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard({ order }) {
  return (
    <div className="card-surface p-3 mb-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <span className="fw-bold">طلب رقم #{order.orderId}</span>
          <span className="text-muted small ms-2">{formatDate(order.creationDate)}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
        <span className="text-muted small">
          {order.items?.length || 0} منتج · {order.distributionChannel} · {order.paymentType}
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="fw-bold text-brand">{formatPrice(order.total)}</span>
          <Link to={`/orders/${order.orderId}`} className="btn btn-outline-brand btn-sm">
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
}
