import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadUnreadCount = async () => {
      if (!user) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const res = await api.get("/api/messages/unread-count");
        const count = Number(res.data?.data?.unreadCount || 0);
        if (active) {
          setUnreadCount(Number.isFinite(count) ? count : 0);
        }
      } catch (_) {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

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
            <button onClick={() => { navigate("/my-listings"); closeMenu(); }}>
              My Listings
            </button>
            <button onClick={() => { navigate("/add-listing"); closeMenu(); }}>
              Add Listing
            </button>
            <Link to="/messages" onClick={closeMenu} className="navbar-messages-link">
              Messages
              {unreadCount > 0 && (
                <span className="navbar-badge" aria-label={`${unreadCount} unread messages`}>
                  {unreadCount}
                </span>
              )}
            </Link>
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
