import { getProductRequest, getProductsRequest } from "../api/product.api";
import type { Paginated, Product, ProductQuery } from "../types/product.types";
import { withErrorMessage } from "../utils/error";

export const productService = {
  list: (query: ProductQuery): Promise<Paginated<Product>> => withErrorMessage(() => getProductsRequest(query)),

  async getById(id: string): Promise<Product> {
    const data = await withErrorMessage(() => getProductRequest(id));
    return data.product;
  },
};
