import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getProduct } from "../api/products";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
        setQuantity(1);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!product) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="fa-box-open"
          title="المنتج غير موجود"
          subtitle="ممكن يكون اتشال أو الرابط غلط."
          action={
            <Link to="/products" className="btn btn-brand">
              الرجوع للمنتجات
            </Link>
          }
        />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [null];
  const inStock = product.stock > 0;

  const handleAdd = () => {
    addItem(
      { id: product.id, name: product.name, price: product.price, stock: product.stock, imageUrl: images[0] },
      quantity
    );
    toast.success(`${product.name} اتضاف للسلة (${quantity})`);
  };

  return (
    <div className="container py-4">
      <nav className="small text-muted mb-3">
        <Link to="/" className="text-reset">الرئيسية</Link> /{" "}
        <Link to="/products" className="text-reset">المنتجات</Link> / {product.name}
      </nav>

      <div className="row g-4">
        {/* المعرض */}
        <div className="col-lg-6">
          <div className="card-surface p-2 mb-2" style={{ aspectRatio: "1 / 1" }}>
            <div className="w-100 h-100 d-flex align-items-center justify-content-center overflow-hidden rounded-3 bg-light">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
              ) : (
                <i className="fa-solid fa-image text-secondary opacity-50" style={{ fontSize: "3.5rem" }} />
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  className="btn p-0 border rounded-3 overflow-hidden"
                  style={{ width: 64, height: 64, borderColor: i === activeImage ? "var(--brand-primary)" : undefined }}
                  onClick={() => setActiveImage(i)}
                >
                  {img ? (
                    <img src={img} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                  ) : (
                    <i className="fa-solid fa-image text-secondary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div className="col-lg-6">
          {product.brand && <span className="badge bg-light text-brand border mb-2">{product.brand}</span>}
          <h2 className="fw-bold">{product.name}</h2>

          {product.categories?.length > 0 && (
            <div className="d-flex gap-2 flex-wrap mb-3">
              {product.categories.map((c) => (
                <span key={c} className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="fs-3 fw-bold text-brand">{formatPrice(product.price)}</span>
            <span className={`stock-badge ${inStock ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
              {inStock ? `متوفر (${product.stock} قطعة)` : "غير متوفر حاليًا"}
            </span>
          </div>

          {product.description && <p className="text-muted">{product.description}</p>}

          {inStock && (
            <div className="d-flex align-items-center gap-3 mt-4">
              <div className="qty-stepper">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
                />
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-brand btn-lg flex-grow-1" onClick={handleAdd}>
                <i className="fa-solid fa-cart-plus me-2" />
                إضافة للسلة
              </button>
            </div>
          )}

          <div className="row g-2 mt-4 pt-3 border-top">
            <div className="col-4 text-center small text-muted">
              <i className="fa-solid fa-truck-fast d-block fs-5 mb-1 text-brand" />
              توصيل سريع
            </div>
            <div className="col-4 text-center small text-muted">
              <i className="fa-solid fa-shield-halved d-block fs-5 mb-1 text-brand" />
              منتج أصلي
            </div>
            <div className="col-4 text-center small text-muted">
              <i className="fa-solid fa-rotate-left d-block fs-5 mb-1 text-brand" />
              استرجاع سهل
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
