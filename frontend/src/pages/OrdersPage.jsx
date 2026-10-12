import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyOrders } from "../api/orders";
import OrderCard from "../components/orders/OrderCard";
import Pagination from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";

export default function OrdersPage() {
  const [result, setResult] = useState({ items: [], totalCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listMyOrders(page, 10)
      .then(setResult)
      .catch(() => setResult({ items: [], totalCount: 0 }))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">طلباتي</h3>

      {loading ? (
        <LoadingSpinner />
      ) : result.items.length === 0 ? (
        <EmptyState
          icon="fa-bag-shopping"
          title="لسه معملتش أي طلب"
          subtitle="اطلب أول منتج وهيظهر هنا."
          action={
            <Link to="/products" className="btn btn-brand">
              تصفح المنتجات
            </Link>
          }
        />
      ) : (
        <>
          {result.items.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
          <Pagination page={result.page || page} pageSize={result.pageSize || 10} totalCount={result.totalCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
