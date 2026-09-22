import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { Role } from "../types/auth.types";

interface FindEmployeesParams {
  roles: Role[];
  search?: string;
  skip: number;
  take: number;
}

export const employeeRepository = {
  /** MySQL string comparison is case-insensitive with the default collation, so `contains` is enough. */
  async findMany({ roles, search, skip, take }: FindEmployeesParams) {
    const where: Prisma.UserWhereInput = {
      role: { in: roles },
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.user.count({ where }),
    ]);
    return { users, total };
  },

  async countByRole(roles: Role[]): Promise<Record<string, number>> {
    if (roles.length === 0) return {};

    const rows = await prisma.user.groupBy({ by: ["role"], where: { role: { in: roles } }, _count: { _all: true } });

    const result: Record<string, number> = Object.fromEntries(roles.map((role) => [role, 0]));
    for (const row of rows) result[row.role] = row._count._all;
    return result;
  },
};
