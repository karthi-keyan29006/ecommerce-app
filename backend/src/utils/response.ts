import { NextFunction, Request, RequestHandler, Response } from "express";
import { User } from "@prisma/client";
import { PublicUser } from "../types/auth.types";

/** An error we throw on purpose; the error middleware turns it into a JSON response. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Lets us use async/await in controllers and forwards any error to the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export const sendResponse = (res: Response, statusCode: number, body: unknown) => res.status(statusCode).json(body);

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const buildMeta = (page: number, limit: number, total: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

export const round2 = (value: number): number => Math.round(value * 100) / 100;

/** The only shape of a user we ever send to the client (no password hash). */
export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});
