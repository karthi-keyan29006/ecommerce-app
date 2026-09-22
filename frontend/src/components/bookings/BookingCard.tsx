import type { Booking, BookingStatus } from "../../types/booking.types";
import { BOOKING_STATUSES } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import StatusBadge from "../common/StatusBadge";

interface BookingCardProps {
  booking: Booking;
  /** Admins see the customer and can change the status. */
  canManage: boolean;
  onStatusChange: (id: string, status: BookingStatus) => void;
}

export default function BookingCard({ booking, canManage, onStatusChange }: BookingCardProps) {
  return (
    <li className="card order">
      <div className="order-head">
        <div>
          <strong>Order {booking.id.slice(0, 8)}</strong>
          <div className="muted">
            {formatDate(booking.createdAt)}
            {canManage && booking.user && <> · {booking.user.name} ({booking.user.email})</>}
          </div>
        </div>

        {canManage ? (
          <select
            className="input status-select"
            value={booking.status}
            disabled={booking.status === "CANCELLED"}
            onChange={(event) => onStatusChange(booking.id, event.target.value as BookingStatus)}
            aria-label={`Status of order ${booking.id.slice(0, 8)}`}
          >
            {BOOKING_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={booking.status} />
        )}
      </div>

      <ul className="order-items">
        {booking.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="order-total">
        <span>Total</span>
        <strong>{formatPrice(booking.total)}</strong>
      </div>
    </li>
  );
}
