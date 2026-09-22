import EmployeeList from "../../components/common/EmployeeList";
import { withLoading } from "../../hoc/withLoading";
import { useDashboard } from "../../hooks/useDashboard";
import type { Role } from "../../types/auth.types";
import type { DashboardStats } from "../../types/booking.types";
import { ROLE_LABELS } from "../../utils/constants";
import { formatPrice } from "../../utils/format";

function Breakdown({ title, data, labelFor }: { title: string; data: Record<string, number>; labelFor: (key: string) => string }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div className="card">
      <h2>{title}</h2>
      <ul className="bars">
        {Object.entries(data).map(([key, count]) => (
          <li key={key}>
            <span className="bar-label">{labelFor(key)}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="bar-count">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardContent({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  const cards = [
    { label: "Total orders", value: stats.totalBookings.toLocaleString("en-IN") },
    { label: "Total products", value: stats.totalProducts.toLocaleString("en-IN") },
    { label: "Employees", value: stats.totalEmployees.toLocaleString("en-IN") },
    { label: "Customers", value: stats.totalCustomers.toLocaleString("en-IN") },
    { label: "Revenue (excl. cancelled)", value: formatPrice(stats.totalRevenue) },
  ];

  return (
    <>
      <div className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="card stat">
            <span className="muted">{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="two-col">
        <Breakdown title="Orders by status" data={stats.bookingsByStatus} labelFor={(key) => key.charAt(0) + key.slice(1).toLowerCase()} />
        <Breakdown title="Employees by role" data={stats.employeesByRole} labelFor={(key) => ROLE_LABELS[key as Role] ?? key} />
      </div>

      <h2 className="section-title">Employees</h2>
      <EmployeeList />
    </>
  );
}

const DashboardContentWithLoading = withLoading(DashboardContent, "Loading dashboard…");

export default function Dashboard() {
  const { stats, status } = useDashboard();

  if (!stats && status === "failed") return <p className="error-text">Could not load the dashboard.</p>;

  return (
    <section>
      <h1>Dashboard</h1>
      <DashboardContentWithLoading loading={!stats} stats={stats} />
    </section>
  );
}
