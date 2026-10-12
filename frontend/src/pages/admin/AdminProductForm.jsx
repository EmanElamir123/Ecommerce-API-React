import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAdminProduct, createProduct, updateProduct } from "../../api/products";
import { listCategories, listBrands } from "../../api/catalog";
import { extractErrorMessage } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  price: "",
  cost: "",
  stock: 0,
  brandId: "",
  categoryIds: [],
  imageUrls: [""],
  isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCategories({ pageSize: 100 }).then((r) => setCategories(r.items || []));
    listBrands({ pageSize: 100 }).then((r) => setBrands(r.items || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getAdminProduct(id)
      .then((p) =>
        setForm({
          code: p.code,
          name: p.name,
          description: p.description || "",
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          brandId: p.brandId || "",
          categoryIds: p.categoryIds || [],
          imageUrls: p.images?.length ? p.images : [""],
          isActive: p.isActive,
        })
      )
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const toggleCategory = (categoryId) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(categoryId)
        ? f.categoryIds.filter((c) => c !== categoryId)
        : [...f.categoryIds, categoryId],
    }));
  };

  const updateImageAt = (index, value) => {
    setForm((f) => {
      const imageUrls = [...f.imageUrls];
      imageUrls[index] = value;
      return { ...f, imageUrls };
    });
  };

  const addImageField = () => setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ""] }));
  const removeImageField = (index) =>
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        brandId: form.brandId ? Number(form.brandId) : null,
        categoryIds: form.categoryIds,
        imageUrls: form.imageUrls.map((u) => u.trim()).filter(Boolean),
        isActive: form.isActive,
      };

      if (isEdit) {
        await updateProduct(id, payload);
        toast.success("تم تعديل المنتج بنجاح");
      } else {
        await createProduct(payload);
        toast.success("تم إنشاء المنتج بنجاح");
      }
      navigate("/admin/products");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Link to="/admin/products" className="small text-muted d-inline-block mb-3">
        <i className="fa-solid fa-arrow-right me-1" /> الرجوع للمنتجات
      </Link>
      <h4 className="fw-bold mb-4">{isEdit ? "تعديل منتج" : "منتج جديد"}</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8 d-flex flex-column gap-4">
            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">البيانات الأساسية</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small">الكود</label>
                  <input className="form-control" value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div className="col-md-8">
                  <label className="form-label small">اسم المنتج</label>
                  <input className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label small">الوصف</label>
                  <textarea className="form-control" rows={4} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">السعر والمخزون</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small">سعر البيع</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">التكلفة</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">الكمية بالمخزون</label>
                  <input type="number" min="0" className="form-control" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="card-surface p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">صور المنتج (روابط)</h6>
                <button type="button" className="btn btn-sm btn-outline-brand" onClick={addImageField}>
                  <i className="fa-solid fa-plus me-1" /> إضافة رابط
                </button>
              </div>
              {form.imageUrls.map((url, i) => (
                <div className="input-group mb-2" key={i}>
                  <input className="form-control" placeholder="https://..." value={url}
                    onChange={(e) => updateImageAt(i, e.target.value)} />
                  <button type="button" className="btn btn-outline-danger" onClick={() => removeImageField(i)}>
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column gap-4">
            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">الماركة والحالة</h6>
              <label className="form-label small">الماركة</label>
              <select className="form-select mb-3" value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                <option value="">بدون ماركة</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="form-check form-switch">
                <input type="checkbox" className="form-check-input" id="isActive" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label className="form-check-label small" htmlFor="isActive">منتج مفعّل وظاهر للعملاء</label>
              </div>
            </div>

            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">التصنيفات</h6>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: 260, overflowY: "auto" }}>
                {categories.map((c) => (
                  <div className="form-check" key={c.id}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`cat-${c.id}`}
                      checked={form.categoryIds.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                    />
                    <label className="form-check-label small" htmlFor={`cat-${c.id}`}>{c.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-brand w-100" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fa-solid fa-floppy-disk me-2" />}
              {isEdit ? "حفظ التعديلات" : "إنشاء المنتج"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
