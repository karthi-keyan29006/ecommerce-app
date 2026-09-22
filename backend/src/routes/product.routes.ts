import { Router } from "express";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { Role } from "../types/auth.types";
import { idParamSchema, listProductsQuerySchema, productBodySchema } from "../validators/product.validator";

const router = Router();
const canManageProducts = [authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN)];

// Public: guests can browse products
router.get("/", validate({ query: listProductsQuerySchema }), listProducts);
router.get("/:id", validate({ params: idParamSchema }), getProduct);

// Admin / Super Admin only
router.post("/", ...canManageProducts, validate({ body: productBodySchema }), createProduct);
router.put("/:id", ...canManageProducts, validate({ params: idParamSchema, body: productBodySchema }), updateProduct);
router.delete("/:id", ...canManageProducts, validate({ params: idParamSchema }), deleteProduct);

export default router;
