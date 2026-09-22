import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { ROLE_LABELS } from "../../utils/constants";
import { canViewDashboard, canViewEmployees } from "../../utils/permissions";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { appName } = useAppContext();

  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          {appName}
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end className={linkClass}>
            Products
          </NavLink>
          {user && (
            <>
              <NavLink to="/cart" className={linkClass}>
                Cart{cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>
            </>
          )}
          {canViewEmployees(user?.role) && (
            <NavLink to="/employees" className={linkClass}>
              Employees
            </NavLink>
          )}
          {canViewDashboard(user?.role) && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <span className="nav-name">
                {user.name} <span className={`role-badge role-${user.role}`}>{ROLE_LABELS[user.role]}</span>
              </span>
              <button className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
