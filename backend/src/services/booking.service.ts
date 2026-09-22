import { Booking, BookingItem, BookingStatus, User } from "@prisma/client";
import { prisma } from "../config/database";
import { bookingRepository } from "../repositories/booking.repository";
import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";
import { AuthUser, Role } from "../types/auth.types";
import { ListBookingsQuery, UpdateStatusInput } from "../types/booking.types";
import { AppError, buildMeta, round2 } from "../utils/response";

type BookingWithRelations = Booking & { items: BookingItem[]; user: User };

const toBookingResponse = (booking: BookingWithRelations) => ({
  id: booking.id,
  status: booking.status,
  total: Number(booking.total),
  createdAt: booking.createdAt,
  user: { id: booking.user.id, name: booking.user.name, email: booking.user.email },
  items: booking.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unitPrice,
      quantity: item.quantity,
      lineTotal: round2(unitPrice * item.quantity),
    };
  }),
});

export const bookingService = {
  /**
   * Turns the user's cart into a booking. Everything happens inside ONE database transaction:
   * either all steps succeed (booking created, stock reduced, cart emptied) or none of them do.
   */
  async createFromCart(userId: string) {
    const bookingId = await prisma.$transaction(async (tx) => {
      const cartItems = await cartRepository.findByUser(userId, tx);
      if (cartItems.length === 0) {
        throw new AppError(400, "Your cart is empty");
      }

      let total = 0;
      const items: { productId: string; productName: string; unitPrice: number; quantity: number }[] = [];

      for (const { product, quantity } of cartItems) {
        if (quantity > product.stock) {
          throw new AppError(409, `Only ${product.stock} of "${product.name}" left in stock. Please update your cart.`);
        }

        // The guarded UPDATE protects against another customer buying the same stock at the same moment.
        const reserved = await productRepository.decrementStock(product.id, quantity, tx);
        if (!reserved) {
          throw new AppError(409, `"${product.name}" just sold out. Please update your cart.`);
        }

        const unitPrice = Number(product.price);
        total += unitPrice * quantity;
        items.push({ productId: product.id, productName: product.name, unitPrice, quantity });
      }

      const booking = await bookingRepository.create({ userId, total: round2(total), items }, tx);
      await cartRepository.clear(userId, tx);

      return booking.id;
    });

    return this.getById(bookingId);
  },

  async getById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError(404, "Booking not found");
    return toBookingResponse(booking);
  },

  /** Admins / Super Admins see every booking; everyone else only sees their own. */
  async list(user: AuthUser, { page, limit, status }: ListBookingsQuery) {
    const canSeeAll = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

    const { bookings, total } = await bookingRepository.findMany({
      userId: canSeeAll ? undefined : user.id,
      status,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: bookings.map(toBookingResponse), meta: buildMeta(page, limit, total) };
  },

  /** Admin only. Cancelling a booking puts the items back into stock. */
  async updateStatus(id: string, { status }: UpdateStatusInput) {
    await prisma.$transaction(async (tx) => {
      const booking = await bookingRepository.findById(id, tx);
      if (!booking) throw new AppError(404, "Booking not found");
      if (booking.status === BookingStatus.CANCELLED) {
        throw new AppError(400, "A cancelled booking cannot be changed");
      }

      if (status === BookingStatus.CANCELLED) {
        for (const item of booking.items) {
          if (item.productId) await productRepository.incrementStock(item.productId, item.quantity, tx);
        }
      }

      await bookingRepository.updateStatus(id, status, tx);
    });

    return this.getById(id);
  },
};
