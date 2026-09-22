import { Router } from "express";
import { createEmployee, listEmployees } from "../controllers/employee.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { Role } from "../types/auth.types";
import { createEmployeeSchema, listEmployeesQuerySchema } from "../validators/auth.validator";

const router = Router();

router.use(authenticate);

// Manager sees STAFF, Admin sees ADMIN/MANAGER/STAFF, Super Admin sees everyone (see VISIBLE_EMPLOYEE_ROLES)
router.get(
  "/",
  authorize(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  validate({ query: listEmployeesQuerySchema }),
  listEmployees
);

router.post("/", authorize(Role.ADMIN, Role.SUPER_ADMIN), validate({ body: createEmployeeSchema }), createEmployee);

export default router;
