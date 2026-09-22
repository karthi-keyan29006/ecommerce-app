import { z } from "zod";
import { listProductsQuerySchema, productBodySchema } from "../validators/product.validator";

export type ProductInput = z.infer<typeof productBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
