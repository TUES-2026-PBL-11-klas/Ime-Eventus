/**
 * Domain types for the Eventus application.
 * Pure type definitions — no framework dependencies.
 */

export type Role = "STUDENT" | "TEACHER" | "COORDINATOR" | "ADMIN";

export type UserRole = "student" | "teacher" | "coordinator" | "admin";

/** Map backend role names to friendly UI role names */
export const ROLE_DISPLAY: Record<Role, UserRole> = {
  STUDENT: "student",
  TEACHER: "teacher",
  COORDINATOR: "coordinator",
  ADMIN: "admin",
};

/** Map UI role names back to backend role names */
export const ROLE_BACKEND: Record<UserRole, Role> = {
  student: "STUDENT",
  teacher: "TEACHER",
  coordinator: "COORDINATOR",
  admin: "ADMIN",
};

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface AuthTokens {
  token: string;
  type: string;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
