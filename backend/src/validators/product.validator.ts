import { z } from "zod";
import { paginationSchema } from "../middleware/validation.middleware";

export const idParamSchema = z.object({ id: z.string().uuid("Invalid id") });

export const listProductsQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
});

export const productBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().trim().max(2000).default(""),
  price: z.coerce.number().positive("Price must be greater than 0").max(10_000_000),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().trim().url("Image URL must be a valid URL").nullable().optional(),
});
