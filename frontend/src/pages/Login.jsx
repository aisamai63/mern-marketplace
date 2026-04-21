import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.data); // Store user and token from backend response
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="login page-shell login--form page-shell--form">
      <div className="login__header page-header">
        <div className="login__header-content">
          <span className="login__kicker page-kicker">Welcome Back</span>
          <h2 className="login__title">Login</h2>
          <p className="login__subtitle page-subtitle">
            Access your marketplace account to manage listings, messages, and orders.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login__form auth-form">
        <div className="login__form-group form-group">
          <label className="login__label">Email</label>
          <input
            className="login__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="login__form-group form-group">
          <label className="login__label">Password</label>
          <input
            className="login__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="login__form-error form-error">{error}</div>}
        <button type="submit" className="login__submit-btn btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="login__footer auth-footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
