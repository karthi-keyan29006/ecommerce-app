import { prisma } from "../config/database";
import { Role } from "../types/auth.types";

export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  create: (data: { name: string; email: string; passwordHash: string; role: Role }) => prisma.user.create({ data }),

  countByRole: (role: Role) => prisma.user.count({ where: { role } }),
};
