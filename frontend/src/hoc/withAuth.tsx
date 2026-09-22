import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "../components/common/PageLoader";
import { useAuth } from "../hooks/useAuth";

/**
 * HOC (Higher-Order Component): takes a component and returns a NEW component
 * that only renders the original when the user is logged in.
 *
 * - still restoring the session after a refresh -> show a loader
 * - not logged in                               -> redirect to /login (and remember where they wanted to go)
 * - logged in                                   -> render the original component with all its props
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  const Guarded = (props: P) => {
    const { isAuthenticated, isHydrating } = useAuth();
    const location = useLocation();

    if (isHydrating) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

    return <Component {...props} />;
  };

  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name ?? "Component"})`;
  return Guarded;
}
