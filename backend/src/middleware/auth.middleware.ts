import { NextFunction, Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { verifyToken } from "../utils/jwt";
import { AppError, asyncHandler } from "../utils/response";

/**
 * Step 1 of protecting a route: "who are you?"
 * Reads "Authorization: Bearer <token>", verifies it and loads the user from the database.
 * We reload the user (instead of trusting the role inside the token) so a changed role
 * or a deleted account takes effect immediately.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required. Please log in.");
  }

  const payload = verifyToken(header.slice(7));
  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw new AppError(401, "This account no longer exists.");
  }

  req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  next();
});
