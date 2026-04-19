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
    const contentType = response.headers.get("content-type");

    let json: unknown;
    try {
      const text = await response.text();

      // Log response for debugging
      console.log(`[API] ${method} ${path}`, {
        status: response.status,
        contentType,
        responseText: text.substring(0, 200),
      });

      if (!text) {
        // Empty response (e.g., 204 No Content)
        if (response.ok) {
          return { success: true, data: undefined as T };
        }
        return {
          success: false,
          error: `Request failed with status ${response.status}`,
        };
      }

      json = JSON.parse(text);
    } catch (parseError) {
      console.error(`[API] Failed to parse response for ${method} ${path}`, parseError);
      return {
        success: false,
        error: `Invalid response format: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
      };
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

    // Check for message field (common in Spring Boot error responses)
    if (
      json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as Record<string, unknown>).message === "string"
    ) {
      return {
        success: false,
        error: String((json as Record<string, unknown>).message),
      };
    }

    return {
      success: false,
      error: `Request failed with status ${response.status}`,
    };
  } catch (error) {
    console.error(`[API] Network error for ${method} ${path}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
