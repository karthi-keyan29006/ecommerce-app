import { z } from "zod";

const quantity = z.coerce.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(99);

export const addItemSchema = z.object({
  productId: z.string().uuid("Invalid product id"),
  quantity: quantity.default(1),
});

export const updateItemSchema = z.object({ quantity });

export const cartItemParamSchema = z.object({ id: z.string().uuid("Invalid cart item id") });
