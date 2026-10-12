import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/client";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";

/**
 * مكون عام لإدارة قوائم بسيطة زي التصنيفات والماركات (نفس الشكل بالظبط:
 * اسم + حالة التفعيل). بيستقبل دوال الـ API كـ props عشان يتقدر يتستخدم
 * لأكتر من نوع بيانات من غير ما نكرر الكود.
 */
export default function CatalogManager({ title, icon, listFn, createFn, updateFn, deactivateFn }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    listFn({ pageSize: 100, includeInactive: true })
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createFn(newName.trim());
      setNewName("");
      toast.success("تمت الإضافة بنجاح");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleUpdate = async (item) => {
    try {
      await updateFn(item.id, { name: editingName.trim(), isActive: item.isActive });
      setEditingId(null);
      toast.success("تم التعديل بنجاح");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateFn(item.id, { name: item.name, isActive: !item.isActive });
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDeactivate = async (item) => {
    if (!window.confirm(`متأكد إنك عايز تعطّل "${item.name}"؟`)) return;
    try {
      await deactivateFn(item.id);
      toast.success("تم التعطيل بنجاح");
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className={`fa-solid ${icon} me-2 text-brand`} />
        {title}
      </h4>

      <div className="card-surface p-3 mb-4">
        <form className="d-flex gap-2" onSubmit={handleCreate}>
          <input
            className="form-control"
            placeholder={`اسم ${title} الجديد`}
            value={newName}
            maxLength={30}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn btn-brand text-nowrap" disabled={saving}>
            <i className="fa-solid fa-plus me-1" /> إضافة
          </button>
        </form>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState icon="fa-folder-open" title="القائمة فاضية" />
        ) : (
          <table className="table table-brand mb-0 align-middle">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الحالة</th>
                <th className="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingId === item.id ? (
                      <input
                        className="form-control form-control-sm"
                        value={editingName}
                        maxLength={30}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${item.isActive ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}
                      role="button"
                      onClick={() => toggleActive(item)}
                      title="اضغط لتغيير الحالة"
                    >
                      {item.isActive ? "مفعّل" : "معطّل"}
                    </span>
                  </td>
                  <td className="text-end">
                    {editingId === item.id ? (
                      <>
                        <button className="btn btn-sm btn-brand me-1" onClick={() => handleUpdate(item)}>
                          حفظ
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-link" onClick={() => startEdit(item)} title="تعديل">
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeactivate(item)} title="تعطيل">
                          <i className="fa-solid fa-ban" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
