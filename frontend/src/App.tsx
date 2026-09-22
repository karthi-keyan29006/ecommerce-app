import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const { hydrate } = useAuth();

  // After a page refresh we have a saved token but no user yet: restore the session.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <AppRoutes />;
}
