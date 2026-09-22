import { userRepository } from "../repositories/user.repository";
import { LoginInput, RegisterInput, Role } from "../types/auth.types";
import { signToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError, toPublicUser } from "../utils/response";

export const authService = {
  /** Public sign-up ALWAYS creates a CUSTOMER. Employees are created by admins (POST /employees). */
  async register(input: RegisterInput) {
    if (await userRepository.findByEmail(input.email)) {
      throw new AppError(409, "An account with this email already exists");
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: Role.CUSTOMER,
    });

    return { user: toPublicUser(user), token: signToken(user) };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    // Same message for "no user" and "wrong password" so attackers cannot discover which emails exist.
    const passwordOk = user ? await comparePassword(input.password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new AppError(401, "Invalid email or password");
    }

    return { user: toPublicUser(user), token: signToken(user) };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    return toPublicUser(user);
  },
};
