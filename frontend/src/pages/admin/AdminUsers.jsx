import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listUsers, updateUserRoles } from "../../api/users";
import { extractErrorMessage } from "../../api/client";
import { ROLES } from "../../utils/lookups";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (user) => {
    setEditingUserId(user.userId);
    setSelectedRoles(
      ROLES.filter((r) => user.roles.includes(r.name)).map((r) => r.id)
    );
  };

  const toggleRole = (roleId) =>
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));

  const handleSave = async (userId) => {
    setSaving(true);
    try {
      await updateUserRoles(userId, selectedRoles);
      toast.success("تم تحديث الصلاحيات بنجاح");
      setEditingUserId(null);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="fa-solid fa-users-gear me-2 text-brand" /> المستخدمين
      </h4>

      <div className="card-surface p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-brand mb-0 align-middle">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الصلاحيات</th>
                <th className="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td className="text-muted small">{u.email}</td>
                  <td>
                    {editingUserId === u.userId ? (
                      <div className="d-flex flex-wrap gap-2">
                        {ROLES.map((r) => (
                          <div className="form-check form-check-inline m-0" key={r.id}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`role-${u.userId}-${r.id}`}
                              checked={selectedRoles.includes(r.id)}
                              onChange={() => toggleRole(r.id)}
                            />
                            <label className="form-check-label small" htmlFor={`role-${u.userId}-${r.id}`}>
                              {r.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="d-flex gap-1 flex-wrap">
                        {u.roles.map((role) => (
                          <span key={role} className="badge bg-secondary-subtle text-secondary-emphasis">
                            {ROLES.find((r) => r.name === role)?.label || role}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    {editingUserId === u.userId ? (
                      <>
                        <button className="btn btn-sm btn-brand me-1" onClick={() => handleSave(u.userId)} disabled={saving}>
                          حفظ
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingUserId(null)}>
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-link" onClick={() => startEdit(u)}>
                        <i className="fa-solid fa-user-pen me-1" /> تعديل الصلاحيات
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
