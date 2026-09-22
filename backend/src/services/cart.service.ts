import { Product } from "@prisma/client";
import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";
import { AddItemInput, UpdateItemInput } from "../types/cart.types";
import { AppError, round2 } from "../utils/response";

const assertEnoughStock = (product: Product, quantity: number) => {
  if (quantity > product.stock) {
    throw new AppError(
      400,
      product.stock === 0 ? `"${product.name}" is out of stock` : `Only ${product.stock} of "${product.name}" left in stock`
    );
  }
};

export const cartService = {
  async getCart(userId: string) {
    const items = await cartRepository.findByUser(userId);

    const mapped = items.map((item) => {
      const price = Number(item.product.price);
      return {
        id: item.id,
        quantity: item.quantity,
        lineTotal: round2(price * item.quantity),
        product: {
          id: item.product.id,
          name: item.product.name,
          price,
          stock: item.product.stock,
          imageUrl: item.product.imageUrl,
        },
      };
    });

    return {
      items: mapped,
      totalItems: mapped.reduce((sum, item) => sum + item.quantity, 0),
      total: round2(mapped.reduce((sum, item) => sum + item.lineTotal, 0)),
    };
  },

  async addItem(userId: string, { productId, quantity }: AddItemInput) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError(404, "Product not found");

    const existing = await cartRepository.findByUserAndProduct(userId, productId);
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    assertEnoughStock(product, newQuantity);

    if (existing) {
      await cartRepository.updateQuantity(existing.id, newQuantity);
    } else {
      await cartRepository.create({ userId, productId, quantity });
    }

    return this.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, { quantity }: UpdateItemInput) {
    const item = await cartRepository.findOwnedItem(itemId, userId);
    if (!item) throw new AppError(404, "Cart item not found");

    assertEnoughStock(item.product, quantity);
    await cartRepository.updateQuantity(item.id, quantity);

    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const removed = await cartRepository.deleteOwnedItem(itemId, userId);
    if (!removed) throw new AppError(404, "Cart item not found");
    return this.getCart(userId);
  },
};
