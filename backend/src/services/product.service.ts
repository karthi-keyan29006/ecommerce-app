import { Product } from "@prisma/client";
import { productRepository } from "../repositories/product.repository";
import { ListProductsQuery, ProductInput } from "../types/product.types";
import { AppError, buildMeta } from "../utils/response";

/** Prisma returns DECIMAL columns as Decimal objects; the API sends plain numbers. */
export const toProductResponse = (product: Product) => ({ ...product, price: Number(product.price) });

export const productService = {
  async list({ page, limit, search }: ListProductsQuery) {
    const { products, total } = await productRepository.findMany({ search, skip: (page - 1) * limit, take: limit });
    return { data: products.map(toProductResponse), meta: buildMeta(page, limit, total) };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError(404, "Product not found");
    return toProductResponse(product);
  },

  async create(input: ProductInput) {
    return toProductResponse(await productRepository.create({ ...input, imageUrl: input.imageUrl ?? null }));
  },

  async update(id: string, input: ProductInput) {
    await this.getById(id);
    return toProductResponse(await productRepository.update(id, { ...input, imageUrl: input.imageUrl ?? null }));
  },

  async remove(id: string) {
    await this.getById(id);
    await productRepository.delete(id);
  },
};
