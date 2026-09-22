import type { Product } from "./product.types";

export interface CartItem {
  id: string;
  quantity: number;
  lineTotal: number;
  product: Pick<Product, "id" | "name" | "price" | "stock" | "imageUrl">;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  total: number;
}
