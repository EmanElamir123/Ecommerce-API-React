import apiClient from "./client";

export const listUsers = () => apiClient.get("/users").then((res) => res.data);

export const updateUserRoles = (userId, roleIds) =>
  apiClient.put(`/users/${userId}/roles`, { roleIds }).then((res) => res.data);

export const getDashboard = () =>
  apiClient.get("/dashboard").then((res) => res.data);
