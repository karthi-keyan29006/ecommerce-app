import { Role } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../middleware/validation.middleware";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const employeeRole = z.enum([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.STAFF]);

export const listEmployeesQuerySchema = paginationSchema.extend({
  role: employeeRole.optional(),
  search: z.string().trim().max(100).optional(),
});

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
  role: employeeRole,
});
