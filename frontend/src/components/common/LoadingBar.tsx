import { useAppStore } from "../../store/app.store";

/** Thin bar at the top of the screen while any API request is running. */
export default function LoadingBar() {
  const busy = useAppStore((state) => state.pendingRequests > 0);
  return <div className={`loading-bar${busy ? " is-active" : ""}`} aria-hidden="true" />;
}
