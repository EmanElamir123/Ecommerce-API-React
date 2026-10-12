import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listFeatured, setFeatured } from "../../api/catalog";
import { listProducts } from "../../api/products";
import { extractErrorMessage } from "../../api/client";
import { formatPrice } from "../../utils/formatters";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminFeatured() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const load = () => {
    setLoading(true);
    listFeatured()
      .then((data) => setItems(data.map((d) => ({ ...d }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const res = await listProducts({ search: search.trim(), pageSize: 8 });
    setSearchResults(res.items || []);
  };

  const addProduct = (product) => {
    if (items.some((i) => i.productId === product.id)) {
      toast.info("المنتج ده مضاف بالفعل");
      return;
    }
    if (items.length >= 20) {
      toast.warning("أقصى عدد للمنتجات المميزة هو 20");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        displayOrder: prev.length + 1,
        showAsNew: false,
      },
    ]);
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateItem = (productId, key, value) =>
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, [key]: value } : i)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setFeatured(
        items.map((i) => ({ productId: i.productId, displayOrder: Number(i.displayOrder), showAsNew: i.showAsNew }))
      );
      toast.success("تم حفظ المنتجات المميزة");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="fa-solid fa-star me-2 text-brand" /> المنتجات المميزة
        </h4>
        <button className="btn btn-brand" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fa-solid fa-floppy-disk me-2" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="card-surface p-3 mb-4">
        <form className="d-flex gap-2" onSubmit={handleSearch}>
          <input className="form-control" placeholder="دوّر على منتج تضيفه..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-outline-brand"><i className="fa-solid fa-magnifying-glass" /></button>
        </form>
        {searchResults.length > 0 && (
          <div className="d-flex flex-column gap-2 mt-3">
            {searchResults.map((p) => (
              <div key={p.id} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                <span className="small">{p.name} — {formatPrice(p.price)}</span>
                <button className="btn btn-sm btn-outline-brand" onClick={() => addProduct(p)}>
                  <i className="fa-solid fa-plus" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          <table className="table table-brand mb-0 align-middle">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>السعر</th>
                <th style={{ width: 120 }}>ترتيب العرض</th>
                <th style={{ width: 100 }}>وسم "جديد"</th>
                <th className="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.productId}>
                  <td>{i.name}</td>
                  <td>{formatPrice(i.price)}</td>
                  <td>
                    <input type="number" className="form-control form-control-sm" value={i.displayOrder}
                      onChange={(e) => updateItem(i.productId, "displayOrder", e.target.value)} />
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input type="checkbox" className="form-check-input" checked={i.showAsNew}
                        onChange={(e) => updateItem(i.productId, "showAsNew", e.target.checked)} />
                    </div>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-link text-danger" onClick={() => removeItem(i.productId)}>
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">مفيش منتجات مميزة، دوّر وأضف من فوق.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
