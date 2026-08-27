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

export function createSupplier(supplierData) {
  return apiRequest("/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplierData),
  });
}

export function updateSupplier(supplierId, supplierData) {
  return apiRequest(`/suppliers/${supplierId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplierData),
  });
}

export function deleteSupplier(supplierId) {
  return apiRequest(`/suppliers/${supplierId}`, { method: "DELETE" });
}
