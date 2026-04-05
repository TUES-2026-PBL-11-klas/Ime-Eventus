import { httpClient } from "@/external/httpClient";
import type { AuthResponseData, LoginInput, RegisterInput } from "@/schemas/auth";

/**
 * Auth service — calls Spring Boot /api/auth endpoints.
 */
export async function login(input: LoginInput) {
  return httpClient<AuthResponseData>("POST", "/api/auth/login", input);
}

export async function register(input: RegisterInput) {
  return httpClient<AuthResponseData>("POST", "/api/auth/register", input);
}
