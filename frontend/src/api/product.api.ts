import type { Paginated, Product, ProductQuery } from "../types/product.types";
import { apiClient } from "./axios";

export const getProductsRequest = async (params: ProductQuery): Promise<Paginated<Product>> => {
  const { data } = await apiClient.get<Paginated<Product>>("/products", { params });
  return data;
};

export const getProductRequest = async (id: string): Promise<{ product: Product }> => {
  const { data } = await apiClient.get<{ product: Product }>(`/products/${id}`);
  return data;
};
