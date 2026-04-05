import { httpClient } from "@/external/httpClient";
import type { UserResponseData, UpdateUserInput } from "@/schemas/auth";

/**
 * User service — calls Spring Boot /api/admin/users endpoints.
 */
export async function getAllUsers(token: string) {
  return httpClient<UserResponseData[]>("GET", "/api/admin/users", undefined, token);
}

export async function getUserById(id: string, token: string) {
  return httpClient<UserResponseData>("GET", `/api/admin/users/${id}`, undefined, token);
}

export async function updateUser(id: string, data: UpdateUserInput, token: string) {
  return httpClient<UserResponseData>("PUT", `/api/admin/users/${id}`, data, token);
}

export async function deactivateUser(id: string, token: string) {
  return httpClient<void>("DELETE", `/api/admin/users/${id}`, undefined, token);
}
