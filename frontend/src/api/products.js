import apiClient from "./client";

/**
 * جلب قائمة المنتجات مع الفلاتر والصفحات.
 * filters ممكن يحتوي: page, pageSize, search, categoryId, brandId, inStock, sortBy, descending, includeInactive
 */
export const listProducts = (filters = {}) =>
  apiClient.get("/products", { params: filters }).then((res) => res.data);

export const getProduct = (id) =>
  apiClient.get(`/products/${id}`).then((res) => res.data);

export const getAdminProduct = (id) =>
  apiClient.get(`/products/${id}/admin`).then((res) => res.data);

export const createProduct = (payload) =>
  apiClient.post("/products", payload).then((res) => res.data);

export const updateProduct = (id, payload) =>
  apiClient.put(`/products/${id}`, payload).then((res) => res.data);

export const deactivateProduct = (id) =>
  apiClient.delete(`/products/${id}`).then((res) => res.data);
