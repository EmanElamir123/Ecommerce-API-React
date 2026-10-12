import apiClient from "./client";

// التصنيفات (Categories)
export const listCategories = (params = {}) =>
  apiClient.get("/categories", { params }).then((res) => res.data);

export const createCategory = (name) =>
  apiClient.post("/categories", { name }).then((res) => res.data);

export const updateCategory = (id, payload) =>
  apiClient.put(`/categories/${id}`, payload).then((res) => res.data);

export const deactivateCategory = (id) =>
  apiClient.delete(`/categories/${id}`).then((res) => res.data);

// الماركات (Brands)
export const listBrands = (params = {}) =>
  apiClient.get("/brands", { params }).then((res) => res.data);

export const createBrand = (name) =>
  apiClient.post("/brands", { name }).then((res) => res.data);

export const updateBrand = (id, payload) =>
  apiClient.put(`/brands/${id}`, payload).then((res) => res.data);

export const deactivateBrand = (id) =>
  apiClient.delete(`/brands/${id}`).then((res) => res.data);

// المنتجات المميزة (Featured)
export const listFeatured = () =>
  apiClient.get("/featured-products").then((res) => res.data);

export const setFeatured = (items) =>
  apiClient.put("/featured-products", items).then((res) => res.data);
