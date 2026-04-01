/**
 * Domain types for the Eventus application.
 * Pure type definitions — no framework dependencies.
 */

export type Role = "ROLE_STUDENT" | "ROLE_TEACHER" | "ROLE_COORDINATOR" | "ROLE_ADMIN";

export type UserRole = "student" | "teacher" | "coordinator" | "admin";

/** Map backend role names to friendly UI role names */
export const ROLE_DISPLAY: Record<Role, UserRole> = {
  ROLE_STUDENT: "student",
  ROLE_TEACHER: "teacher",
  ROLE_COORDINATOR: "coordinator",
  ROLE_ADMIN: "admin",
};

/** Map UI role names back to backend role names */
export const ROLE_BACKEND: Record<UserRole, Role> = {
  student: "ROLE_STUDENT",
  teacher: "ROLE_TEACHER",
  coordinator: "ROLE_COORDINATOR",
  admin: "ROLE_ADMIN",
};

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export interface AuthTokens {
  token: string;
  type: string;
}

export interface UserRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: number;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
