import { useCallback, useEffect, useState } from "react";
import { bookingService } from "../services/booking.service";
import type { Booking, BookingStatus } from "../types/booking.types";
import type { LoadStatus, PageMeta } from "../types/product.types";
import { BOOKINGS_PAGE_SIZE } from "../utils/constants";
import { useAppContext } from "./useAppContext";
import { useCart } from "./useCart";

/** Bookings (orders) list with pagination and status updates. */
export function useBookings() {
  const { notify } = useAppContext();
  const [items, setItems] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    bookingService
      .list({ page, limit: BOOKINGS_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setItems(result.data);
        setMeta(result.meta);
        setStatus("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Could not load orders";
        setError(message);
        setStatus("failed");
        notify.error(message);
      });
    return () => {
      cancelled = true;
    };
  }, [page, notify]);

  const updateStatus = useCallback(
    async (id: string, next: BookingStatus): Promise<void> => {
      try {
        const updated = await bookingService.updateStatus(id, next);
        setItems((current) => current.map((booking) => (booking.id === updated.id ? updated : booking)));
        notify.success("Order status updated");
      } catch (err) {
        notify.error(err instanceof Error ? err.message : "Could not update the order");
      }
    },
    [notify]
  );

  return { items, meta, status, error, page, setPage, updateStatus };
}

/** Places an order from the current cart. The server empties the cart, so we mirror that locally. */
export function usePlaceOrder() {
  const { notify } = useAppContext();
  const { clear } = useCart();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async (): Promise<boolean> => {
    setPlacing(true);
    try {
      await bookingService.create();
      clear();
      notify.success("Order placed. Thank you!");
      return true;
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Could not place the order");
      return false;
    } finally {
      setPlacing(false);
    }
  };

  return { placing, placeOrder };
}
