import { BookingStatus, Prisma } from "@prisma/client";
import { DbClient, prisma } from "../config/database";

interface NewBooking {
  userId: string;
  total: number;
  items: { productId: string; productName: string; unitPrice: number; quantity: number }[];
}

interface FindBookingsParams {
  userId?: string;
  status?: BookingStatus;
  skip: number;
  take: number;
}

const withRelations = { items: true, user: true } satisfies Prisma.BookingInclude;

export const bookingRepository = {
  create: (data: NewBooking, db: DbClient = prisma) =>
    db.booking.create({
      data: {
        userId: data.userId,
        total: data.total,
        status: BookingStatus.PENDING,
        items: { create: data.items },
      },
    }),

  findById: (id: string, db: DbClient = prisma) => db.booking.findUnique({ where: { id }, include: withRelations }),

  async findMany({ userId, status, skip, take }: FindBookingsParams) {
    const where: Prisma.BookingWhereInput = { ...(userId ? { userId } : {}), ...(status ? { status } : {}) };

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({ where, include: withRelations, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.booking.count({ where }),
    ]);
    return { bookings, total };
  },

  updateStatus: (id: string, status: BookingStatus, db: DbClient = prisma) =>
    db.booking.update({ where: { id }, data: { status } }),

  count: () => prisma.booking.count(),

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await prisma.booking.groupBy({ by: ["status"], _count: { _all: true } });
    return Object.fromEntries(rows.map((row) => [row.status, row._count._all]));
  },

  /** Total revenue of every booking that was not cancelled. */
  async sumRevenue(): Promise<number> {
    const result = await prisma.booking.aggregate({
      _sum: { total: true },
      where: { status: { not: BookingStatus.CANCELLED } },
    });
    return Number(result._sum.total ?? 0);
  },
};
