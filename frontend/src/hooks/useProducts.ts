import { useEffect, useState } from "react";
import { productService } from "../services/product.service";
import type { LoadStatus, PageMeta, Product } from "../types/product.types";
import { PRODUCTS_PAGE_SIZE } from "../utils/constants";
import { useAppContext } from "./useAppContext";
import { useDebounce } from "./useDebounce";

/** Product list with debounced search and pagination. */
export function useProducts() {
  const { notify } = useAppContext();
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    productService
      .list({ page, limit: PRODUCTS_PAGE_SIZE, search: debouncedSearch || undefined })
      .then((result) => {
        if (cancelled) return;
        setItems(result.data);
        setMeta(result.meta);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load products";
        setError(message);
        setStatus("failed");
        notify.error(message);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, notify]);

  return { items, meta, status, error, search, setSearch, debouncedSearch, page, setPage };
}

/** A single product by id. */
export function useProduct(id: string | undefined) {
  const { notify } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus("loading");
    setProduct(null);
    setError(null);
    productService
      .getById(id)
      .then((result) => {
        if (cancelled) return;
        setProduct(result);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load product";
        setError(message);
        setStatus("failed");
        notify.error(message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, notify]);

  return { product, status, error };
}
