import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "../components/common/PageLoader";
import { useAuth } from "../hooks/useAuth";

/** Opposite of withAuth: login/register pages are hidden from users who are already logged in. */
export function withGuestOnly<P extends object>(Component: ComponentType<P>) {
  const GuestOnly = (props: P) => {
    const { user, isHydrating } = useAuth();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

    if (isHydrating) return <PageLoader />;
    if (user) return <Navigate to={from} replace />;

    return <Component {...props} />;
  };

  GuestOnly.displayName = `withGuestOnly(${Component.displayName ?? Component.name ?? "Component"})`;
  return GuestOnly;
}
