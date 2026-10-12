import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFeatured, listCategories } from "../api/catalog";
import { formatPrice } from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([listFeatured(), listCategories({ pageSize: 12 })])
      .then(([featuredData, categoriesData]) => {
        if (!mounted) return;
        setFeatured(featuredData || []);
        setCategories(categoriesData?.items || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container py-4">
      {/* الهيرو */}
      <section className="hero-section p-4 p-md-5 mb-5">
        <div className="row align-items-center">
          <div className="col-lg-7 position-relative" style={{ zIndex: 1 }}>
            <h1 className="fw-bold display-6 mb-3">كل اللي محتاجه... في مكان واحد</h1>
            <p className="mb-4 opacity-75">
              تسوّق آلاف المنتجات بأسعار تنافسية، مع توصيل سريع وضمان استرجاع لمدة 14 يوم.
            </p>
            <Link to="/products" className="btn btn-accent btn-lg">
              ابدأ التسوق الآن
              <i className="fa-solid fa-arrow-left ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* التصنيفات */}
          {categories.length > 0 && (
            <section className="mb-5">
              <h4 className="section-title mb-3">تصفح حسب التصنيف</h4>
              <div className="d-flex gap-2 flex-wrap">
                {categories.map((c) => (
                  <Link key={c.id} to={`/products?categoryId=${c.id}`} className="category-chip">
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* المنتجات المميزة */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="section-title mb-0">منتجات مختارة لك</h4>
              <Link to="/products" className="small fw-semibold text-brand">
                عرض الكل <i className="fa-solid fa-arrow-left ms-1" />
              </Link>
            </div>

            {featured.length === 0 ? (
              <p className="text-muted">لا توجد منتجات مميزة حاليًا.</p>
            ) : (
              <div className="row g-3">
                {featured.map((item) => (
                  <div className="col-6 col-md-4 col-lg-3" key={item.productId}>
                    <Link to={`/products/${item.productId}`} className="product-card d-block text-reset">
                      <div className="product-card__image-wrap position-relative">
                        {item.showAsNew && (
                          <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">جديد</span>
                        )}
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} loading="lazy" />
                        ) : (
                          <i className="fa-solid fa-image text-secondary opacity-50" style={{ fontSize: "2.5rem" }} />
                        )}
                      </div>
                      <div className="product-card__body">
                        <h6 className="fw-bold mb-1 text-truncate">{item.name}</h6>
                        <span className="product-card__price">{formatPrice(item.price)}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* مميزات المتجر */}
          <section className="row g-3 text-center mb-4">
            {[
              { icon: "fa-truck-fast", title: "توصيل سريع", desc: "لكل محافظات مصر" },
              { icon: "fa-shield-halved", title: "دفع آمن", desc: "بياناتك محمية بالكامل" },
              { icon: "fa-rotate-left", title: "استرجاع مجاني", desc: "خلال 14 يوم من الاستلام" },
            ].map((f) => (
              <div className="col-md-4" key={f.title}>
                <div className="card-surface p-4 h-100">
                  <i className={`fa-solid ${f.icon} fs-2 text-brand mb-2`} />
                  <h6 className="fw-bold">{f.title}</h6>
                  <p className="text-muted small mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
