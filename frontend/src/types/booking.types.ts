export type BookingStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface BookingItem {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  total: number;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  items: BookingItem[];
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface DashboardStats {
  totalBookings: number;
  totalProducts: number;
  totalEmployees: number;
  totalCustomers: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
  employeesByRole: Record<string, number>;
}
