import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="card empty">
      <h1>You don’t have access to this page</h1>
      <p className="muted">Your role does not include this area. If you think this is a mistake, ask an administrator.</p>
      <Link to="/" className="btn btn-primary">
        Back to products
      </Link>
    </div>
  );
}
