import z from "zod";

// ── Auth Schemas ────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roles: z.array(z.string()).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  type: z.string(),
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(z.string()),
});
export type AuthResponseData = z.infer<typeof AuthResponseSchema>;

// ── User Schemas ────────────────────────────────────────────

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  active: z.boolean(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserResponseData = z.infer<typeof UserResponseSchema>;

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  active: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ── Category Schemas ────────────────────────────────────────

export const CategoryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoryResponseData = z.infer<typeof CategoryResponseSchema>;

export const CategoryRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  color: z.string().min(1, "Color is required"),
});
export type CategoryRequestInput = z.infer<typeof CategoryRequestSchema>;
