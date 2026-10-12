import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { listProducts, deactivateProduct } from "../../api/products";
import { formatPrice } from "../../utils/formatters";
import { extractErrorMessage } from "../../api/client";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

export default function AdminProducts() {
  const [result, setResult] = useState({ items: [], totalCount: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listProducts({ page, pageSize: 15, search: search || undefined, includeInactive: true })
      .then(setResult)
      .catch(() => setResult({ items: [], totalCount: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDeactivate = async (product) => {
    if (!window.confirm(`متأكد إنك عايز تعطّل "${product.name}"؟`)) return;
    try {
      await deactivateProduct(product.id);
      toast.success("تم تعطيل المنتج");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          <i className="fa-solid fa-boxes-stacked me-2 text-brand" /> المنتجات
        </h4>
        <Link to="/admin/products/new" className="btn btn-brand">
          <i className="fa-solid fa-plus me-1" /> منتج جديد
        </Link>
      </div>

      <form className="d-flex gap-2 mb-3" style={{ maxWidth: 360 }} onSubmit={handleSearchSubmit}>
        <input className="form-control" placeholder="ابحث بالاسم أو الكود..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-outline-brand"><i className="fa-solid fa-magnifying-glass" /></button>
      </form>

      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : result.items.length === 0 ? (
          <EmptyState icon="fa-box-open" title="مفيش منتجات" />
        ) : (
          <div className="table-responsive">
            <table className="table table-brand mb-0 align-middle">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكود</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>الحالة</th>
                  <th className="text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-2 bg-light overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
                          ) : (
                            <i className="fa-solid fa-image text-secondary opacity-50 small" />
                          )}
                        </div>
                        <span className="text-truncate" style={{ maxWidth: 220 }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="text-muted small">{p.code}</td>
                    <td className="fw-semibold">{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${p.stock > 0 ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                        {p.stock > 0 ? "متاح" : "غير متاح"}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/products/${p.id}/edit`} className="btn btn-sm btn-link" title="تعديل">
                        <i className="fa-solid fa-pen" />
                      </Link>
                      <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeactivate(p)} title="تعطيل">
                        <i className="fa-solid fa-ban" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={result.page || page} pageSize={result.pageSize || 15} totalCount={result.totalCount} onPageChange={setPage} />
    </div>
  );
}
