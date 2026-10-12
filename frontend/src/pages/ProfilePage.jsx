import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile, changePassword } from "../api/auth";
import { extractErrorMessage } from "../api/client";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || "", lastName: user.lastName || "", phone: user.phone || "" });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateMyProfile(form);
      await refreshProfile();
      toast.success("تم تحديث بياناتك بنجاح");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("تم تغيير كلمة المرور بنجاح");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">الملف الشخصي</h3>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card-surface p-4">
            <h6 className="fw-bold mb-3">
              <i className="fa-solid fa-id-card me-2 text-brand" />
              البيانات الشخصية
            </h6>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label small">البريد الإلكتروني</label>
                <input className="form-control" value={user?.email || ""} disabled />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small">الاسم الأول</label>
                  <input className="form-control" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="col-6">
                  <label className="form-label small">الاسم الأخير</label>
                  <input className="form-control" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label small">رقم الهاتف</label>
                <input className="form-control" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <button className="btn btn-brand" disabled={savingProfile}>
                {savingProfile ? <span className="spinner-border spinner-border-sm" /> : "حفظ التعديلات"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card-surface p-4">
            <h6 className="fw-bold mb-3">
              <i className="fa-solid fa-key me-2 text-brand" />
              تغيير كلمة المرور
            </h6>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label small">كلمة المرور الحالية</label>
                <input type="password" className="form-control" value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
              </div>
              <div className="mb-4">
                <label className="form-label small">كلمة المرور الجديدة</label>
                <input type="password" className="form-control" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
              </div>
              <button className="btn btn-outline-brand" disabled={savingPassword}>
                {savingPassword ? <span className="spinner-border spinner-border-sm" /> : "تحديث كلمة المرور"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
