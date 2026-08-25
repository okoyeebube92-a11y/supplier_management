import { apiRequest } from "./client";

export function getSuppliers({ signal } = {}) {
  return apiRequest("/suppliers", { signal });
}

export function getSupplierById(supplierId, { signal } = {}) {
  return apiRequest(`/suppliers/${supplierId}`, { signal });
}

export function getSupplierOrders(supplierId, { signal } = {}) {
  return apiRequest(`/suppliers/${supplierId}/orders`, { signal });
}
