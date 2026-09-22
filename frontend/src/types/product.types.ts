/** These types mirror the JSON returned by the backend API. */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T, M = PageMeta> {
  data: T[];
  meta: M;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export type LoadStatus = "idle" | "loading" | "failed";
