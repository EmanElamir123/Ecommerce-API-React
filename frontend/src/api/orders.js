import apiClient from "./client";

export const createOrder = (payload) =>
  apiClient.post("/orders", payload).then((res) => res.data);

export const listMyOrders = (page = 1, pageSize = 20) =>
  apiClient.get("/orders", { params: { page, pageSize } }).then((res) => res.data);

export const getOrder = (id) =>
  apiClient.get(`/orders/${id}`).then((res) => res.data);

export const trackGuestOrder = (id, trackingToken) =>
  apiClient
    .get(`/orders/${id}/tracking`, {
      headers: { "X-Order-Tracking-Token": trackingToken },
    })
    .then((res) => res.data);

// statusId اختياري: لو سبته فاضي السيستم بيقدّم الطلب للحالة الجاية تلقائيًا
export const advanceOrderStatus = (id, statusId = null) =>
  apiClient
    .patch(`/orders/${id}/status`, { statusId })
    .then((res) => res.data);
