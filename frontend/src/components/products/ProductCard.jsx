import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const inStock = product.stock > 0;
  const image = product.imageUrl;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} اتضاف للسلة`);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="text-decoration-none text-reset">
        <div className="product-card__image-wrap">
          {image ? (
            <img src={image} alt={product.name} loading="lazy" />
          ) : (
            <i className="fa-solid fa-image text-secondary opacity-50" style={{ fontSize: "2.5rem" }} />
          )}
        </div>
        <div className="product-card__body">
          {product.brand && <span className="text-muted small">{product.brand}</span>}
          <h6 className="fw-bold mb-1 text-truncate" title={product.name}>
            {product.name}
          </h6>
          <div className="d-flex align-items-center justify-content-between mt-auto">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            <span className={`stock-badge ${inStock ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
              {inStock ? "متوفر" : "غير متوفر"}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          className="btn btn-brand btn-sm w-100"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          <i className="fa-solid fa-cart-plus me-2" />
          إضافة للسلة
        </button>
      </div>
    </div>
  );
}
