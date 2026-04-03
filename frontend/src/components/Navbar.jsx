import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/listings" className="navbar-brand" onClick={closeMenu}>
        Marketplace
      </Link>

      <button
        className="navbar-toggle"
        aria-label="Toggle navigation menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        ☰
      </button>

      <div className={`navbar-links${menuOpen ? " open" : ""}`}>
        {user ? (
          <>
            <button onClick={() => { navigate("/add-listing"); closeMenu(); }}>
              Add Listing
            </button>
            <Link to="/wishlist" onClick={closeMenu}>Wishlist</Link>
            {user.role === "admin" && (
              <Link to="/admin" onClick={closeMenu}>Admin</Link>
            )}
            <button onClick={() => { navigate("/profile"); closeMenu(); }}>
              Profile
            </button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" onClick={closeMenu}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
