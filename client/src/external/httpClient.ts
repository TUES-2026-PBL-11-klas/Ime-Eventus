import { type ApiResponse } from "@/schemas/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Client-side HTTP helper for direct browser → Spring Boot calls.
 * Used for auth endpoints and any authenticated client-side requests.
 */
export async function httpClient<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  token?: string,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return { success: false, error: "Invalid response format" };
    }

    if (response.ok) {
      return { success: true, data: json as T };
    }

    // Try to extract error message from backend's standard shape
    if (
      json &&
      typeof json === "object" &&
      "error" in json &&
      typeof (json as Record<string, unknown>).error === "string"
    ) {
      return {
        success: false,
        error: String((json as Record<string, unknown>).error),
      };
    }

    return {
      success: false,
      error: `Request failed with status ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
