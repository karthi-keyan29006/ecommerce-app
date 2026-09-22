import { Link } from "react-router-dom";
import BookingCard from "../../components/bookings/BookingCard";
import PageLoader from "../../components/common/PageLoader";
import Pagination from "../../components/common/Pagination";
import { useAuth } from "../../hooks/useAuth";
import { useBookings } from "../../hooks/useBookings";
import type { BookingStatus } from "../../types/booking.types";
import { canManageBookings } from "../../utils/permissions";

export default function Bookings() {
  const { user } = useAuth();
  const { items, meta, status, error, setPage, updateStatus } = useBookings();

  const canManage = canManageBookings(user?.role);

  const changeStatus = (id: string, next: BookingStatus) => {
    if (next === "CANCELLED" && !window.confirm("Cancel this order? Items go back into stock and this cannot be undone.")) return;
    void updateStatus(id, next);
  };

  if (status === "loading" && items.length === 0) return <PageLoader label="Loading orders…" />;

  return (
    <section>
      <h1>{canManage ? "All orders" : "My orders"}</h1>

      {status === "failed" ? (
        <p className="error-text">{error}</p>
      ) : items.length === 0 ? (
        <div className="card empty">
          <p className="muted">No orders yet.</p>
          <Link to="/" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="order-list">
          {items.map((booking) => (
            <BookingCard key={booking.id} booking={booking} canManage={canManage} onStatusChange={changeStatus} />
          ))}
        </ul>
      )}

      <Pagination meta={meta} onChange={setPage} />
    </section>
  );
}
