import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role, TokenPayload } from "../types/auth.types";
import { AppError } from "./response";

export const signToken = (user: { id: string; role: Role }): string =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

export const verifyToken = (token: string): TokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub) {
      throw new Error("Malformed token");
    }
    return { sub: payload.sub, role: payload.role as Role };
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
};
