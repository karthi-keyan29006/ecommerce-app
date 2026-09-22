import { Prisma } from "@prisma/client";
import { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/response";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/** One place that turns every error into a consistent JSON shape: { message, errors? } */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.details });
  }

  // Malformed JSON body sent by the client
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint (e.g. email already registered)
    if (err.code === "P2002") return res.status(409).json({ message: "This record already exists" });
    // Record to update/delete does not exist
    if (err.code === "P2025") return res.status(404).json({ message: "Record not found" });
  }

  console.error(err);
  return res.status(500).json({
    message: env.NODE_ENV === "production" ? "Something went wrong" : String(err?.message ?? err),
  });
};
