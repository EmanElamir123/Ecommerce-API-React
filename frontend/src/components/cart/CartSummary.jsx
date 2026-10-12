import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";

export default function CartSummary({ totalItems, totalPrice, checkoutTo = "/checkout" }) {
  return (
    <div className="card-surface p-4">
      <h6 className="fw-bold mb-3">ملخص الطلب</h6>
      <div className="d-flex justify-content-between mb-2 text-muted">
        <span>عدد القطع</span>
        <span>{totalItems}</span>
      </div>
      <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
        <span>الإجمالي</span>
        <span className="text-brand">{formatPrice(totalPrice)}</span>
      </div>
      <Link to={checkoutTo} className={`btn btn-brand w-100 ${totalItems === 0 ? "disabled" : ""}`}>
        <i className="fa-solid fa-lock me-2" />
        إتمام الشراء
      </Link>
      <p className="text-muted small mt-2 mb-0">الشحن والضرائب هيتحسبوا في خطوة الدفع.</p>
    </div>
  );
}
