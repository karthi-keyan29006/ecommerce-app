import { useCartStore } from "../store/cart.store";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const totalItems = useCartStore((state) => state.totalItems);
  const status = useCartStore((state) => state.status);
  const error = useCartStore((state) => state.error);
  const fetch = useCartStore((state) => state.fetch);
  const add = useCartStore((state) => state.add);
  const update = useCartStore((state) => state.update);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  return { items, total, totalItems, status, error, isLoading: status === "loading", fetch, add, update, remove, clear };
}
