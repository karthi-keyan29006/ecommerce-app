import type { Cart } from "../types/cart.types";
import { apiClient } from "./axios";

export const getCartRequest = async (): Promise<{ cart: Cart }> => {
  const { data } = await apiClient.get<{ cart: Cart }>("/cart");
  return data;
};

export const addCartItemRequest = async (productId: string, quantity: number): Promise<{ cart: Cart }> => {
  const { data } = await apiClient.post<{ cart: Cart }>("/cart/items", { productId, quantity });
  return data;
};

export const updateCartItemRequest = async (itemId: string, quantity: number): Promise<{ cart: Cart }> => {
  const { data } = await apiClient.put<{ cart: Cart }>(`/cart/items/${itemId}`, { quantity });
  return data;
};

export const removeCartItemRequest = async (itemId: string): Promise<{ cart: Cart }> => {
  const { data } = await apiClient.delete<{ cart: Cart }>(`/cart/items/${itemId}`);
  return data;
};
