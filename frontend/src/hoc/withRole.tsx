import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth.types";
import { hasRole } from "../utils/permissions";
import { withAuth } from "./withAuth";

/**
 * HOC for role-based screens. It COMPOSES withAuth:
 *   1. withAuth makes sure the user is logged in
 *   2. this gate makes sure the user's role is allowed
 *
 * This only hides screens for a better user experience.
 * The REAL protection is on the server, which always re-checks the role.
 */
export function withRole<P extends object>(Component: ComponentType<P>, allowedRoles: readonly Role[]) {
  const RoleGate = (props: P) => {
    const { user } = useAuth();

    if (!hasRole(user?.role, allowedRoles)) return <Navigate to="/unauthorized" replace />;

    return <Component {...props} />;
  };

  RoleGate.displayName = `withRole(${Component.displayName ?? Component.name ?? "Component"})`;
  return withAuth(RoleGate);
}
