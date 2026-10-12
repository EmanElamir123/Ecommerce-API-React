import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listProducts } from "../api/products";
import { listCategories, listBrands } from "../api/catalog";
import ProductGrid from "../components/products/ProductGrid";
import ProductFilters from "../components/products/ProductFilters";
import Pagination from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";

const DEFAULT_FILTERS = { page: 1, pageSize: 12, sortBy: "name", descending: false };

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get("search") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
  }));
  const [result, setResult] = useState({ items: [], totalCount: 0 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories({ pageSize: 100 }).then((r) => setCategories(r.items || []));
    listBrands({ pageSize: 100 }).then((r) => setBrands(r.items || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    listProducts(filters)
      .then(setResult)
      .catch(() => setResult({ items: [], totalCount: 0 }))
      .finally(() => setLoading(false));

    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">
        {filters.search ? `نتائج البحث عن "${filters.search}"` : "كل المنتجات"}
      </h3>

      <div className="row g-4">
        <div className="col-lg-3">
          <ProductFilters
            filters={filters}
            categories={categories}
            brands={brands}
            onChange={setFilters}
            onReset={handleReset}
          />
        </div>

        <div className="col-lg-9">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <p className="text-muted small mb-3">{result.totalCount} منتج</p>
              <ProductGrid products={result.items} />
              <Pagination
                page={result.page || filters.page}
                pageSize={result.pageSize || filters.pageSize}
                totalCount={result.totalCount}
                onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
