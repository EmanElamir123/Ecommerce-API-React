export default function EmptyState({ icon = "fa-box-open", title, subtitle, action }) {
  return (
    <div className="empty-state">
      <i className={`fa-solid ${icon}`} />
      <h5 className="fw-bold mb-1">{title}</h5>
      {subtitle && <p className="mb-3">{subtitle}</p>}
      {action}
    </div>
  );
}
