import { Prisma } from "@prisma/client";
import { DbClient, prisma } from "../config/database";

interface FindProductsParams {
  search?: string;
  skip: number;
  take: number;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export const productRepository = {
  async findMany({ search, skip, take }: FindProductsParams) {
    const where: Prisma.ProductWhereInput = search
      ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] }
      : {};

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({ where, orderBy: [{ createdAt: "desc" }, { name: "asc" }], skip, take }),
      prisma.product.count({ where }),
    ]);
    return { products, total };
  },

  findById: (id: string, db: DbClient = prisma) => db.product.findUnique({ where: { id } }),

  findByIds: (ids: string[], db: DbClient = prisma) => db.product.findMany({ where: { id: { in: ids } } }),

  count: () => prisma.product.count(),

  create: (data: ProductData) => prisma.product.create({ data }),

  update: (id: string, data: ProductData) => prisma.product.update({ where: { id }, data }),

  delete: (id: string) => prisma.product.delete({ where: { id } }),

  /**
   * Atomic "take stock": the `stock >= quantity` condition lives inside the UPDATE itself,
   * so two customers can never buy the last item at the same time. Returns false if there was not enough.
   */
  async decrementStock(id: string, quantity: number, db: DbClient = prisma): Promise<boolean> {
    const result = await db.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return result.count === 1;
  },

  /** Puts stock back (used when a booking is cancelled). Silently ignores products that were deleted. */
  incrementStock: (id: string, quantity: number, db: DbClient = prisma) =>
    db.product.updateMany({ where: { id }, data: { stock: { increment: quantity } } }),
};
