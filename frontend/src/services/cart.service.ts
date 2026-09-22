import {
  addCartItemRequest,
  getCartRequest,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../api/cart.api";
import type { Cart } from "../types/cart.types";
import { withErrorMessage } from "../utils/error";

// Every cart endpoint returns the full, updated cart.
export const cartService = {
  async get(): Promise<Cart> {
    return (await withErrorMessage(() => getCartRequest())).cart;
  },
  async addItem(productId: string, quantity: number): Promise<Cart> {
    return (await withErrorMessage(() => addCartItemRequest(productId, quantity))).cart;
  },
  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return (await withErrorMessage(() => updateCartItemRequest(itemId, quantity))).cart;
  },
  async removeItem(itemId: string): Promise<Cart> {
    return (await withErrorMessage(() => removeCartItemRequest(itemId))).cart;
  },
};
