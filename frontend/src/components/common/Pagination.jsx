/**
 * Pagination بسيط بيستخدم بيانات PagedResult الراجعة من الـ API:
 * { page, pageSize, totalCount } أو أي شكل مشابه.
 */
export default function Pagination({ page, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            <i className="fa-solid fa-angle-right" />
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button
              className="page-link"
              style={p === page ? { backgroundColor: "var(--brand-primary)", borderColor: "var(--brand-primary)" } : {}}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            <i className="fa-solid fa-angle-left" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
