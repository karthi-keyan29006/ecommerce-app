import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { Role } from "../types/auth.types";

const router = Router();

// Mounted at /admin  =>  GET /admin/dashboard
router.get("/dashboard", authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), getDashboard);

export default router;
