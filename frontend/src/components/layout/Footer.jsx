export default function Footer() {
  return (
    <footer className="brand-footer mt-5 pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 fw-bold fs-5 text-white mb-2">
              <i className="fa-solid fa-store text-warning" />
              دُكّان
            </div>
            <p className="small mb-0">
              وجهتك للتسوق الإلكتروني بأفضل الأسعار وأسرع توصيل، منتجات أصلية 100% وضمان استرجاع.
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="text-white fw-bold mb-3">روابط سريعة</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <a href="/products">تصفح المنتجات</a>
              </li>
              <li>
                <a href="/track-order">تتبع الطلب</a>
              </li>
              <li>
                <a href="/orders">طلباتي</a>
              </li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="text-white fw-bold mb-3">تواصل معنا</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>
                <i className="fa-solid fa-phone me-2" /> 19000
              </li>
              <li>
                <i className="fa-solid fa-envelope me-2" /> support@dokan.example
              </li>
              <li className="d-flex gap-3 mt-2 fs-5">
                <a href="#"><i className="fa-brands fa-facebook" /></a>
                <a href="#"><i className="fa-brands fa-instagram" /></a>
                <a href="#"><i className="fa-brands fa-tiktok" /></a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <p className="text-center small mb-0">© {new Date().getFullYear()} دُكّان. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
