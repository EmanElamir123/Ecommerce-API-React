import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { useCart } from "../../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <div
        className="rounded-3 bg-light flex-shrink-0 d-flex align-items-center justify-content-center overflow-hidden"
        style={{ width: 76, height: 76 }}
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
        ) : (
          <i className="fa-solid fa-image text-secondary opacity-50" />
        )}
      </div>

      <div className="flex-grow-1 min-w-0">
        <Link to={`/products/${product.id}`} className="fw-bold text-reset d-block text-truncate">
          {product.name}
        </Link>
        <span className="text-muted small">{formatPrice(product.price)} للقطعة</span>
      </div>

      <div className="qty-stepper">
        <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)}>
          −
        </button>
        <input
          type="number"
          value={quantity}
          min={1}
          max={product.stock ?? 99}
          onChange={(e) => updateQuantity(product.id, Number(e.target.value) || 1)}
        />
        <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)}>
          +
        </button>
      </div>

      <div className="fw-bold text-nowrap" style={{ minWidth: 90, textAlign: "left" }}>
        {formatPrice(lineTotal)}
      </div>

      <button className="btn btn-link text-danger" onClick={() => removeItem(product.id)} title="إزالة">
        <i className="fa-solid fa-trash-can" />
      </button>
    </div>
  );
}
