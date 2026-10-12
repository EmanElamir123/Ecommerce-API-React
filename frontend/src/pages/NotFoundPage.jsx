import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <i className="fa-solid fa-compass text-brand" style={{ fontSize: "4rem" }} />
      <h2 className="fw-bold mt-3">404 - الصفحة مش موجودة</h2>
      <p className="text-muted mb-4">يمكن الرابط غلط أو الصفحة اتشالت.</p>
      <Link to="/" className="btn btn-brand">
        الرجوع للرئيسية
      </Link>
    </div>
  );
}
