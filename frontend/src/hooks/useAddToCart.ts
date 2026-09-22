import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "./useAppContext";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

/** Guests are sent to the login page; logged-in users get the item added to their cart. */
export function useAddToCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { add } = useCart();
  const { notify } = useAppContext();

  return async (productId: string, quantity = 1): Promise<void> => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    // The cart store already shows the server's error message as a toast.
    if (await add(productId, quantity)) notify.success("Added to cart");
  };
}
