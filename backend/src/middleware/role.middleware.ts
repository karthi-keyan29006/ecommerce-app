import { NextFunction, Request, Response } from "express";
import { Role } from "../types/auth.types";
import { AppError } from "../utils/response";

/**
 * Step 2 of protecting a route: "are you allowed to do this?"
 * Usage: router.get("/x", authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN), handler)
 */
export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required. Please log in."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action."));
    }
    next();
  };
