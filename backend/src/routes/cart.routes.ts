import { Router } from "express";
import { addItem, getCart, removeItem, updateItem } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { addItemSchema, cartItemParamSchema, updateItemSchema } from "../validators/cart.validator";

const router = Router();

// Every cart route needs a logged-in user
router.use(authenticate);

router.get("/", getCart);
router.post("/items", validate({ body: addItemSchema }), addItem);
router.put("/items/:id", validate({ params: cartItemParamSchema, body: updateItemSchema }), updateItem);
router.delete("/items/:id", validate({ params: cartItemParamSchema }), removeItem);

export default router;
