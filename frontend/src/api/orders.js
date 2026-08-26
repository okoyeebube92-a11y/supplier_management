import { apiRequest } from "./client";

export function getOrderById(orderId, { signal } = {}) {
  return apiRequest(`/orders/${orderId}`, { signal });
}

export function createPayment(orderId, paymentData) {
  return apiRequest(`/orders/${orderId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });
}

export function createConsolidation(orderId, itemId, consolidationData) {
  return apiRequest(`/orders/${orderId}/items/${itemId}/consolidations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consolidationData),
  });
}
