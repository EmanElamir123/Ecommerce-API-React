import ProductCard from "./ProductCard";
import EmptyState from "../common/EmptyState";

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <EmptyState icon="fa-magnifying-glass" title="مفيش منتجات مطابقة" subtitle="جرّب تغيّر الفلاتر أو كلمة البحث." />;
  }

  return (
    <div className="row g-3">
      {products.map((product) => (
        <div className="col-6 col-md-4 col-lg-3" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
