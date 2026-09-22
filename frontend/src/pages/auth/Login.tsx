import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS, TEST_ACCOUNTS } from "../../utils/constants";

// Navigation after a successful login is handled by the withGuestOnly HOC (it redirects logged-in users).
export default function Login() {
  const { login, clearError, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void login({ email: email.trim(), password });
  };

  return (
    <div className="auth-layout">
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>

        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={isLoading || !email || !password}>
          {isLoading ? "Logging in…" : "Log in"}
        </button>

        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>

      <aside className="card test-accounts">
        <h2>Test accounts</h2>
        <p className="muted">Pick a role to fill the form, then press Log in.</p>
        <ul>
          {TEST_ACCOUNTS.map((account) => (
            <li key={account.role}>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                {ROLE_LABELS[account.role]}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
