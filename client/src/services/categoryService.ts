import { httpClient } from "@/external/httpClient";
import type { CategoryResponseData, CategoryRequestInput } from "@/schemas/auth";

/**
 * Category service — calls Spring Boot /api/categories and /api/admin/categories endpoints.
 */
export async function getActiveCategories() {
  return httpClient<CategoryResponseData[]>("GET", "/api/categories");
}

export async function getAllCategories(token: string) {
  return httpClient<CategoryResponseData[]>("GET", "/api/admin/categories", undefined, token);
}

export async function createCategory(data: CategoryRequestInput, token: string) {
  return httpClient<CategoryResponseData>("POST", "/api/admin/categories", data, token);
}

export async function updateCategory(id: string, data: CategoryRequestInput, token: string) {
  return httpClient<CategoryResponseData>("PUT", `/api/admin/categories/${id}`, data, token);
}

export async function deactivateCategory(id: string, token: string) {
  return httpClient<void>("DELETE", `/api/admin/categories/${id}`, undefined, token);
}
