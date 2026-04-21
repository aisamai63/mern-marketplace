import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register page-shell register--form page-shell--form">
      <div className="register__header page-header">
        <div className="register__header-content">
          <span className="register__kicker page-kicker">Get Started</span>
          <h2 className="register__title">Register</h2>
          <p className="register__subtitle page-subtitle">
            Create your profile to start buying, selling, and saving favorites.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="register__form auth-form">
        <div className="register__form-group form-group">
          <label className="register__label">Name</label>
          <input
            className="register__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="register__form-group form-group">
          <label className="register__label">Email</label>
          <input
            className="register__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="register__form-group form-group">
          <label className="register__label">Password</label>
          <input
            className="register__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="register__form-error form-error">{error}</div>}
        <button type="submit" className="register__submit-btn btn-primary">Register</button>
      </form>
      <p className="register__footer auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
