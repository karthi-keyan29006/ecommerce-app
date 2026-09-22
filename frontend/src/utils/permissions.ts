import { Role } from "../types/auth.types";

export const ADMIN_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
export const EMPLOYEE_VIEWER_ROLES: readonly Role[] = [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN];

/** Which roles may create which employee roles (the server enforces this too). */
export const CREATABLE_EMPLOYEE_ROLES: Record<Role, Role[]> = {
  SUPER_ADMIN: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.STAFF],
  ADMIN: [Role.MANAGER, Role.STAFF],
  MANAGER: [],
  STAFF: [],
  CUSTOMER: [],
};

/**
 * Route -> who may open it.
 * `null` = public, `"authenticated"` = any logged-in user, otherwise an explicit role list.
 */
export const ROUTE_ACCESS: Record<string, readonly Role[] | "authenticated" | null> = {
  "/": null,
  "/cart": "authenticated",
  "/orders": "authenticated",
  "/employees": EMPLOYEE_VIEWER_ROLES,
  "/dashboard": ADMIN_ROLES,
};

export const hasRole = (role: Role | undefined | null, allowed: readonly Role[]): boolean =>
  !!role && allowed.includes(role);

export const canViewEmployees = (role?: Role | null): boolean => hasRole(role, EMPLOYEE_VIEWER_ROLES);
export const canViewDashboard = (role?: Role | null): boolean => hasRole(role, ADMIN_ROLES);
export const canManageBookings = (role?: Role | null): boolean => hasRole(role, ADMIN_ROLES);
export const creatableEmployeeRoles = (role?: Role | null): Role[] => (role ? CREATABLE_EMPLOYEE_ROLES[role] : []);

/** Routes a given role (or a guest) may open. */
export const getAllowedRoutes = (role?: Role | null): string[] =>
  Object.entries(ROUTE_ACCESS)
    .filter(([, access]) => {
      if (access === null) return true;
      if (!role) return false;
      return access === "authenticated" || access.includes(role);
    })
    .map(([path]) => path);
