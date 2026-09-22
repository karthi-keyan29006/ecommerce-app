import { create } from "zustand";
import { cartService } from "../services/cart.service";
import type { Cart, CartItem } from "../types/cart.types";
import type { LoadStatus } from "../types/product.types";
import { useAppStore } from "./app.store";

interface CartState {
  items: CartItem[];
  totalItems: number;
  total: number;
  status: LoadStatus;
  error: string | null;
  fetch: () => Promise<boolean>;
  add: (productId: string, quantity: number) => Promise<boolean>;
  update: (itemId: string, quantity: number) => Promise<boolean>;
  remove: (itemId: string) => Promise<boolean>;
  /** Resets local state only (after logout, or after an order was placed: the server empties the cart itself). */
  clear: () => void;
}

const emptyCart: Cart = { items: [], totalItems: 0, total: 0 };

export const useCartStore = create<CartState>((set) => {
  // Every cart endpoint returns the full, updated cart, so they all share this runner.
  const run = async (request: () => Promise<Cart>): Promise<boolean> => {
    set({ status: "loading", error: null });
    try {
      const cart = await request();
      set({ status: "idle", items: cart.items, totalItems: cart.totalItems, total: cart.total });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cart request failed";
      set({ status: "idle", error: message });
      useAppStore.getState().showToast("error", message);
      return false;
    }
  };

  return {
    ...emptyCart,
    status: "idle",
    error: null,
    fetch: () => run(() => cartService.get()),
    add: (productId, quantity) => run(() => cartService.addItem(productId, quantity)),
    update: (itemId, quantity) => run(() => cartService.updateItem(itemId, quantity)),
    remove: (itemId) => run(() => cartService.removeItem(itemId)),
    clear: () => set({ ...emptyCart, status: "idle", error: null }),
  };
});
