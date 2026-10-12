export default function LoadingSpinner({ label = "جاري التحميل..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border spinner-brand" role="status">
        <span className="visually-hidden">جاري التحميل</span>
      </div>
      <p className="text-muted mt-3 mb-0">{label}</p>
    </div>
  );
}
