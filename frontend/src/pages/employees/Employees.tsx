import { useState, type FormEvent } from "react";
import EmployeeList from "../../components/common/EmployeeList";
import { useAuth } from "../../hooks/useAuth";
import { useCreateEmployee } from "../../hooks/useEmployees";
import type { Role } from "../../types/auth.types";
import { ROLE_LABELS } from "../../utils/constants";
import { creatableEmployeeRoles } from "../../utils/permissions";

export default function Employees() {
  const { user } = useAuth();
  const role = user?.role;
  const { creating, create } = useCreateEmployee();

  const creatableRoles = creatableEmployeeRoles(role);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>(creatableRoles[0] ?? "STAFF");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const created = await create({ name: name.trim(), email: email.trim(), password, role: newRole });
    if (!created) return;
    setName("");
    setEmail("");
    setPassword("");
    setRefreshKey((key) => key + 1); // tells the list to reload
  };

  return (
    <section>
      <h1>Employees</h1>
      <p className="muted">
        {role === "MANAGER" ? "You can view the staff list." : "Employees you have permission to view."}
      </p>

      {creatableRoles.length > 0 && (
        <form className="card form-inline" onSubmit={handleSubmit}>
          <h2>Add employee</h2>
          <div className="form-row">
            <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Full name" required />
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" required />
            <input className="input" type="password" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Temporary password" required />
            <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} aria-label="Role">
              {creatableRoles.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? "Adding…" : "Add employee"}
            </button>
          </div>
        </form>
      )}

      <EmployeeList refreshKey={refreshKey} />
    </section>
  );
}
