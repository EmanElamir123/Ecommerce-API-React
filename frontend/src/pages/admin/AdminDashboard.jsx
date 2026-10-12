import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api/users";
import { formatPrice } from "../../utils/formatters";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const statCards = [
  { key: "finishedOrders", label: "طلبات مكتملة", icon: "fa-circle-check", color: "#0f6e5f" },
  { key: "activeProducts", label: "منتجات نشطة", icon: "fa-boxes-stacked", color: "#2b7fff" },
  { key: "soldProducts", label: "قطع مباعة", icon: "fa-tags", color: "#ffb648" },
  { key: "shippedProducts", label: "قطع تم شحنها", icon: "fa-truck", color: "#8b5cf6" },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-danger">تعذّر تحميل بيانات الداشبورد.</p>;

  return (
    <div>
      <h4 className="fw-bold mb-4">نظرة عامة</h4>

      <div className="row g-3 mb-4">
        {statCards.map((s) => (
          <div className="col-md-3 col-6" key={s.key}>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ backgroundColor: s.color }}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <div>
                <div className="fs-4 fw-bold">{data[s.key] ?? 0}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card-surface p-3">
            <h6 className="fw-bold mb-3">
              <i className="fa-solid fa-fire me-2 text-brand" /> الأكثر مبيعًا
            </h6>
            <ProductMiniList products={data.topSelling} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card-surface p-3">
            <h6 className="fw-bold mb-3">
              <i className="fa-solid fa-eye me-2 text-brand" /> الأكثر زيارة
            </h6>
            <ProductMiniList products={data.topVisited} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductMiniList({ products }) {
  if (!products || products.length === 0) return <p className="text-muted small mb-0">لا توجد بيانات كافية بعد.</p>;
  return (
    <div className="d-flex flex-column gap-2">
      {products.map((p) => (
        <Link
          to={`/products/${p.id}`}
          key={p.id}
          className="d-flex align-items-center gap-2 text-reset py-1 border-bottom"
        >
          <div className="rounded-2 bg-light overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
            ) : (
              <i className="fa-solid fa-image text-secondary opacity-50 small" />
            )}
          </div>
          <span className="flex-grow-1 text-truncate small">{p.name}</span>
          <span className="fw-semibold small">{formatPrice(p.price)}</span>
        </Link>
      ))}
    </div>
  );
}
