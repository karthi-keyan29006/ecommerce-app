import type { PageMeta } from "./product.types";

/** Roles used by the UI. Must match the backend enum. */
export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export type AuthStatus = "hydrating" | "idle" | "loading";

/** Employees are users with a staff role. */
export type Employee = User;

export type EmployeeMeta = PageMeta & { availableRoles: Role[] };

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}
