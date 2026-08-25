const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status) {
    super("The requested information is unavailable.");
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json();
}
