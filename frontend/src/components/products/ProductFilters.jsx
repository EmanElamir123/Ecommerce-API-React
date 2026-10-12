export default function ProductFilters({ filters, categories, brands, onChange, onReset }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="card-surface p-3">
      <h6 className="fw-bold mb-3">
        <i className="fa-solid fa-sliders me-2 text-brand" />
        الفلاتر
      </h6>

      <div className="mb-3">
        <label className="form-label small fw-semibold">التصنيف</label>
        <select
          className="form-select"
          value={filters.categoryId || ""}
          onChange={(e) => update("categoryId", e.target.value || undefined)}
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-semibold">الماركة</label>
        <select
          className="form-select"
          value={filters.brandId || ""}
          onChange={(e) => update("brandId", e.target.value || undefined)}
        >
          <option value="">كل الماركات</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-semibold">الترتيب حسب</label>
        <select
          className="form-select mb-2"
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value)}
        >
          <option value="name">الاسم</option>
          <option value="price">السعر</option>
        </select>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="descending"
            checked={filters.descending}
            onChange={(e) => update("descending", e.target.checked)}
          />
          <label className="form-check-label small" htmlFor="descending">
            ترتيب تنازلي
          </label>
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="inStock"
          checked={Boolean(filters.inStock)}
          onChange={(e) => update("inStock", e.target.checked ? true : undefined)}
        />
        <label className="form-check-label small" htmlFor="inStock">
          المتوفر فقط
        </label>
      </div>

      <button className="btn btn-outline-brand btn-sm w-100" onClick={onReset}>
        <i className="fa-solid fa-rotate-left me-2" />
        إعادة تعيين الفلاتر
      </button>
    </div>
  );
}
