import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders";
import { extractErrorMessage } from "../api/client";
import { PAYMENT_TYPES, DISTRIBUTION_CHANNELS, PROVINCES } from "../utils/lookups";
import { formatPrice } from "../utils/formatters";
import EmptyState from "../components/common/EmptyState";

const emptyAddress = { provinceId: "", cityName: "", zipCode: "", streetName: "", streetNumber: "", flat: "", details: "" };
const emptyGuest = { firstName: "", lastName: "", email: "", phone: "" };

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(emptyAddress);
  const [guest, setGuest] = useState(emptyGuest);
  const [paymentTypeId, setPaymentTypeId] = useState(PAYMENT_TYPES[0]?.id || "");
  const [distributionChannelId, setDistributionChannelId] = useState(DISTRIBUTION_CHANNELS[0]?.id || "");
  const [needsAddress, setNeedsAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="fa-cart-shopping"
          title="السلة فاضية"
          subtitle="محتاج تضيف منتجات للسلة الأول قبل ما تكمل الشراء."
          action={
            <Link to="/products" className="btn btn-brand">
              تصفح المنتجات
            </Link>
          }
        />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated && (!guest.firstName || !guest.lastName || !guest.email)) {
      setError("من فضلك أكمل بيانات التواصل عشان نقدر نأكد الطلب.");
      return;
    }
    if (needsAddress && (!address.provinceId || !address.cityName || !address.streetName || !address.streetNumber)) {
      setError("من فضلك أكمل بيانات عنوان الشحن.");
      return;
    }

    const payload = {
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paymentTypeId: Number(paymentTypeId),
      distributionChannelId: Number(distributionChannelId),
      deliveryAddress: needsAddress
        ? {
            provinceId: Number(address.provinceId),
            cityName: address.cityName,
            zipCode: address.zipCode || null,
            streetName: address.streetName,
            streetNumber: address.streetNumber,
            flat: address.flat || null,
            details: address.details || null,
          }
        : null,
      guestCustomer: isAuthenticated ? null : guest,
    };

    setSubmitting(true);
    try {
      const created = await createOrder(payload);
      clearCart();
      toast.success("تم إنشاء الطلب بنجاح 🎉");
      navigate(`/order-confirmation/${created.order.orderId}`, {
        state: { order: created.order, guestTrackingToken: created.guestTrackingToken },
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">إتمام الشراء</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8 d-flex flex-column gap-4">
            {/* بيانات التواصل للزائر */}
            {!isAuthenticated && (
              <div className="card-surface p-4">
                <h6 className="fw-bold mb-3">
                  <i className="fa-solid fa-user me-2 text-brand" />
                  بيانات التواصل
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small">الاسم الأول</label>
                    <input className="form-control" value={guest.firstName}
                      onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">الاسم الأخير</label>
                    <input className="form-control" value={guest.lastName}
                      onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">البريد الإلكتروني</label>
                    <input type="email" className="form-control" value={guest.email}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">رقم الهاتف (اختياري)</label>
                    <input className="form-control" value={guest.phone}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                  </div>
                </div>
                <p className="small text-muted mt-3 mb-0">
                  عندك حساب بالفعل؟ <Link to="/login">سجّل دخولك</Link> عشان تتابع طلباتك بسهولة.
                </p>
              </div>
            )}

            {isAuthenticated && (
              <div className="card-surface p-4">
                <h6 className="fw-bold mb-1">
                  <i className="fa-solid fa-user-check me-2 text-brand" />
                  الطلب باسم {user?.firstName} {user?.lastName}
                </h6>
                <p className="text-muted small mb-0">{user?.email}</p>
              </div>
            )}

            {/* عنوان الشحن */}
            <div className="card-surface p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="fa-solid fa-location-dot me-2 text-brand" />
                  عنوان الشحن
                </h6>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="needsAddress"
                    checked={needsAddress} onChange={(e) => setNeedsAddress(e.target.checked)} />
                  <label className="form-check-label small" htmlFor="needsAddress">محتاج توصيل</label>
                </div>
              </div>

              {needsAddress && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small">المحافظة</label>
                    <select className="form-select" value={address.provinceId}
                      onChange={(e) => setAddress({ ...address, provinceId: e.target.value })} required>
                      <option value="">اختر المحافظة</option>
                      {PROVINCES.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">المدينة / المركز</label>
                    <input className="form-control" value={address.cityName}
                      onChange={(e) => setAddress({ ...address, cityName: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">اسم الشارع</label>
                    <input className="form-control" value={address.streetName}
                      onChange={(e) => setAddress({ ...address, streetName: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">رقم العقار</label>
                    <input className="form-control" value={address.streetNumber}
                      onChange={(e) => setAddress({ ...address, streetNumber: e.target.value })} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">الرمز البريدي (اختياري)</label>
                    <input className="form-control" value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">الشقة / الدور (اختياري)</label>
                    <input className="form-control" value={address.flat}
                      onChange={(e) => setAddress({ ...address, flat: e.target.value })} />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small">تفاصيل إضافية (اختياري)</label>
                    <input className="form-control" value={address.details}
                      onChange={(e) => setAddress({ ...address, details: e.target.value })}
                      placeholder="علامة مميزة، أقرب معلم..." />
                  </div>
                </div>
              )}
            </div>

            {/* الدفع والشحن */}
            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">
                <i className="fa-solid fa-truck me-2 text-brand" />
                طريقة الدفع والشحن
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">طريقة الدفع</label>
                  <select className="form-select" value={paymentTypeId} onChange={(e) => setPaymentTypeId(e.target.value)}>
                    {PAYMENT_TYPES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small">طريقة الاستلام</label>
                  <select className="form-select" value={distributionChannelId} onChange={(e) => setDistributionChannelId(e.target.value)}>
                    {DISTRIBUTION_CHANNELS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="col-lg-4">
            <div className="card-surface p-4">
              <h6 className="fw-bold mb-3">مراجعة الطلب</h6>
              <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 220, overflowY: "auto" }}>
                {items.map((item) => (
                  <div key={item.product.id} className="d-flex justify-content-between small">
                    <span className="text-truncate" style={{ maxWidth: 160 }}>{item.product.name} × {item.quantity}</span>
                    <span className="fw-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-3 mb-3">
                <span>الإجمالي</span>
                <span className="text-brand">{formatPrice(totalPrice)}</span>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <button type="submit" className="btn btn-brand w-100" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> جاري تأكيد الطلب...</>
                ) : (
                  <><i className="fa-solid fa-circle-check me-2" /> تأكيد الطلب</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
