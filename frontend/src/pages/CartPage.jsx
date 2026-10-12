import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyState from "../components/common/EmptyState";

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="fa-cart-shopping"
          title="السلة فاضية"
          subtitle="لسه مضفتش أي منتج للسلة، يلا نبدأ نتسوق!"
          action={
            <Link to="/products" className="btn btn-brand">
              تصفح المنتجات
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">سلة التسوق</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-surface p-3 p-md-4">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <CartSummary totalItems={totalItems} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
