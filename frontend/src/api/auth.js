import apiClient from "./client";

// كل الطلبات المتعلقة بتسجيل الدخول والتسجيل الجديد وإدارة الحساب

export const login = (credentials) =>
  apiClient.post("/auth/login", credentials).then((res) => res.data);

export const register = (payload) =>
  apiClient.post("/auth/register", payload).then((res) => res.data);

export const changePassword = (payload) =>
  apiClient.post("/auth/change-password", payload).then((res) => res.data);

export const getMyProfile = () =>
  apiClient.get("/users/me").then((res) => res.data);

export const updateMyProfile = (payload) =>
  apiClient.put("/users/me", payload).then((res) => res.data);
