import type { ComponentType } from "react";
import PageLoader from "../components/common/PageLoader";

export interface WithLoadingProps {
  loading?: boolean;
}

/** Shows a PageLoader instead of the wrapped component while the `loading` prop is true. */
export function withLoading<P extends object>(Component: ComponentType<P>, label?: string) {
  const WithLoading = ({ loading = false, ...props }: P & WithLoadingProps) => {
    if (loading) return <PageLoader label={label} />;
    return <Component {...(props as unknown as P)} />;
  };

  WithLoading.displayName = `withLoading(${Component.displayName ?? Component.name ?? "Component"})`;
  return WithLoading;
}
