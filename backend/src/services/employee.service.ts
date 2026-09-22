import { employeeRepository } from "../repositories/employee.repository";
import { userRepository } from "../repositories/user.repository";
import {
  AuthUser,
  CREATABLE_EMPLOYEE_ROLES,
  CreateEmployeeInput,
  ListEmployeesQuery,
  VISIBLE_EMPLOYEE_ROLES,
} from "../types/auth.types";
import { hashPassword } from "../utils/password";
import { AppError, buildMeta, toPublicUser } from "../utils/response";

export const employeeService = {
  /** Each role only sees the employee roles listed for it in VISIBLE_EMPLOYEE_ROLES. */
  async list(actor: AuthUser, { page, limit, role, search }: ListEmployeesQuery) {
    const visibleRoles = VISIBLE_EMPLOYEE_ROLES[actor.role];

    if (role && !visibleRoles.includes(role)) {
      throw new AppError(403, `You do not have permission to view ${role} accounts`);
    }

    const { users, total } = await employeeRepository.findMany({
      roles: role ? [role] : visibleRoles,
      search,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map(toPublicUser),
      meta: { ...buildMeta(page, limit, total), availableRoles: visibleRoles },
    };
  },

  async create(actor: AuthUser, input: CreateEmployeeInput) {
    if (!CREATABLE_EMPLOYEE_ROLES[actor.role].includes(input.role)) {
      throw new AppError(403, `You do not have permission to create ${input.role} accounts`);
    }
    if (await userRepository.findByEmail(input.email)) {
      throw new AppError(409, "An account with this email already exists");
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    });
    return toPublicUser(user);
  },
};
