import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { register, clearError, error, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Quick checks so the user gets instant feedback (the server validates again).
    if (name.trim().length < 2) return setLocalError("Enter your name (at least 2 characters).");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return setLocalError("Password needs at least 8 characters, including a letter and a number.");
    }

    setLocalError(null);
    void register({ name: name.trim(), email: email.trim(), password });
  };

  const message = localError ?? error;

  return (
    <div className="auth-layout">
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>

        <label className="field">
          <span>Name</span>
          <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span>Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <small className="muted">At least 8 characters, with a letter and a number.</small>
        </label>

        {message && (
          <p className="error-text" role="alert">
            {message}
          </p>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={isLoading || !name || !email || !password}>
          {isLoading ? "Creating account…" : "Create account"}
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
