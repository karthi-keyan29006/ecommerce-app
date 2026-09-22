import type { BookingStatus } from "../../types/booking.types";

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`status-badge status-${status}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}
