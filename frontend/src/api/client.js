const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, { message, details } = {}) {
    super(message || "The requested information is unavailable.");
    this.name = "ApiError";
    this.status = status;
    this.details = details;
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
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON server failures still receive the same safe generic handling.
    }
    throw new ApiError(response.status, {
      message: typeof errorData.error === "string" ? errorData.error : undefined,
      details: Array.isArray(errorData.details) ? errorData.details.filter((detail) => typeof detail === "string") : undefined,
    });
  }

  if (response.status === 204) return null;
  return response.json();
}
