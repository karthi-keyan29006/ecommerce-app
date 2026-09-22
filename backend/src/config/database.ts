import { PrismaClient } from "@prisma/client";

/** One shared Prisma client for the whole app. */
export const prisma = new PrismaClient();

/** Either the shared client or the client handed to us inside `prisma.$transaction(...)`. */
export type DbClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
