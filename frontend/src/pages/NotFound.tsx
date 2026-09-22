import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card empty">
      <h1>Page not found</h1>
      <p className="muted">The address you opened does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to products
      </Link>
    </div>
  );
}
