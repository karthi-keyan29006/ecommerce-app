import { z } from "zod";
import { addItemSchema, updateItemSchema } from "../validators/cart.validator";

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
