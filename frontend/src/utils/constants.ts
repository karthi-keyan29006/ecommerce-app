import { Role } from "../types/auth.types";
import type { BookingStatus } from "../types/booking.types";

export const APP_NAME = "DeskShop";
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export const TOKEN_KEY = "deskshop_token";

export const PRODUCTS_PAGE_SIZE = 8;
export const EMPLOYEES_PAGE_SIZE = 8;
export const BOOKINGS_PAGE_SIZE = 5;
export const TOAST_DURATION_MS = 4500;

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

export const BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

// The same accounts the seed script creates (also listed in the README).
export const TEST_ACCOUNTS: { role: Role; email: string; password: string }[] = [
  { role: Role.SUPER_ADMIN, email: "superadmin@example.com", password: "SuperAdmin@123" },
  { role: Role.ADMIN, email: "admin@example.com", password: "Admin@1234" },
  { role: Role.MANAGER, email: "manager@example.com", password: "Manager@123" },
  { role: Role.STAFF, email: "staff@example.com", password: "Staff@1234" },
  { role: Role.CUSTOMER, email: "customer@example.com", password: "Customer@123" },
];
