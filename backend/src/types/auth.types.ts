import { Role } from "@prisma/client";
import { z } from "zod";
import { createEmployeeSchema, listEmployeesQuerySchema, loginSchema, registerSchema } from "../validators/auth.validator";

export { Role };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** The only shape of a user we ever send to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface TokenPayload {
  sub: string;
  role: Role;
}

// Tell TypeScript that req.user exists after authenticate() runs.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/**
 * Which employee roles each role is allowed to SEE / CREATE.
 * Keeping these rules in one place makes RBAC easy to read and easy to change.
 */
export const VISIBLE_EMPLOYEE_ROLES: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.STAFF],
  [Role.ADMIN]: [Role.ADMIN, Role.MANAGER, Role.STAFF],
  [Role.MANAGER]: [Role.STAFF],
  [Role.STAFF]: [],
  [Role.CUSTOMER]: [],
};

export const CREATABLE_EMPLOYEE_ROLES: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.STAFF],
  [Role.ADMIN]: [Role.MANAGER, Role.STAFF],
  [Role.MANAGER]: [],
  [Role.STAFF]: [],
  [Role.CUSTOMER]: [],
};
