import { apiRequest } from "./client";

export function getOrderById(orderId, { signal } = {}) {
  return apiRequest(`/orders/${orderId}`, { signal });
}
