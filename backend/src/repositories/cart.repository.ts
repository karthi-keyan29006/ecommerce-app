import { DbClient, prisma } from "../config/database";

export const cartRepository = {
  findByUser: (userId: string, db: DbClient = prisma) =>
    db.cartItem.findMany({ where: { userId }, include: { product: true }, orderBy: { createdAt: "asc" } }),

  findByUserAndProduct: (userId: string, productId: string) =>
    prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } }),

  /** Filtering by userId means users can only touch their OWN cart items. */
  findOwnedItem: (id: string, userId: string) =>
    prisma.cartItem.findFirst({ where: { id, userId }, include: { product: true } }),

  create: (data: { userId: string; productId: string; quantity: number }) => prisma.cartItem.create({ data }),

  updateQuantity: (id: string, quantity: number) => prisma.cartItem.update({ where: { id }, data: { quantity } }),

  async deleteOwnedItem(id: string, userId: string): Promise<boolean> {
    const result = await prisma.cartItem.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },

  clear: (userId: string, db: DbClient = prisma) => db.cartItem.deleteMany({ where: { userId } }),
};
