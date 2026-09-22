import { BookingStatus } from "@prisma/client";
import { bookingRepository } from "../repositories/booking.repository";
import { employeeRepository } from "../repositories/employee.repository";
import { productRepository } from "../repositories/product.repository";
import { userRepository } from "../repositories/user.repository";
import { AuthUser, Role, VISIBLE_EMPLOYEE_ROLES } from "../types/auth.types";
import { round2 } from "../utils/response";

export const dashboardService = {
  async getDashboard(actor: AuthUser) {
    const visibleRoles = VISIBLE_EMPLOYEE_ROLES[actor.role];

    const [totalBookings, totalProducts, totalCustomers, employeesByRole, statusCounts, revenue] = await Promise.all([
      bookingRepository.count(),
      productRepository.count(),
      userRepository.countByRole(Role.CUSTOMER),
      employeeRepository.countByRole(visibleRoles),
      bookingRepository.countByStatus(),
      bookingRepository.sumRevenue(),
    ]);

    const bookingsByStatus: Record<string, number> = Object.fromEntries(
      Object.values(BookingStatus).map((status) => [status, statusCounts[status] ?? 0])
    );
    const totalEmployees = Object.values(employeesByRole).reduce((sum, count) => sum + count, 0);

    return {
      totalBookings,
      totalProducts,
      totalEmployees,
      totalCustomers,
      totalUsers: totalEmployees + totalCustomers,
      totalRevenue: round2(revenue),
      bookingsByStatus,
      employeesByRole,
    };
  },
};
