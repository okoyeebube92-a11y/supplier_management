import { apiRequest } from "./client";

export function getSuppliers({ signal } = {}) {
  return apiRequest("/suppliers", { signal });
}
