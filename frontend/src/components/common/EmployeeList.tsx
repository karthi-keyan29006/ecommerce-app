import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useEmployees } from "../../hooks/useEmployees";
import type { Role } from "../../types/auth.types";
import { EMPLOYEES_PAGE_SIZE, ROLE_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import PageLoader from "./PageLoader";
import Pagination from "./Pagination";

/**
 * Employee table with role filter, search and pagination.
 * The server decides which roles this user may see; the filter only offers those roles.
 */
export default function EmployeeList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [role, setRole] = useState<Role | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { items, meta, availableRoles, status, error } = useEmployees(
    { page, limit: EMPLOYEES_PAGE_SIZE, role: role || undefined, search: debouncedSearch || undefined },
    refreshKey
  );

  return (
    <div className="card">
      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Search employees"
        />
        <select
          className="input"
          value={role}
          onChange={(event) => {
            setRole(event.target.value as Role | "");
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {availableRoles.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && items.length === 0 ? (
        <PageLoader label="Loading employees…" />
      ) : status === "failed" ? (
        <p className="error-text">{error}</p>
      ) : items.length === 0 ? (
        <p className="muted empty">No employees match this filter.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {items.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>
                    <span className={`role-badge role-${employee.role}`}>{ROLE_LABELS[employee.role]}</span>
                  </td>
                  <td>{formatDate(employee.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onChange={setPage} />
    </div>
  );
}
