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
      <Link to="/listings" className="navbar__brand" onClick={closeMenu}>
        Marketplace
      </Link>

      <button
        className="navbar__toggle"
        aria-label="Toggle navigation menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        Menu
      </button>

      <div className={`navbar__links navbar-links${menuOpen ? " navbar__links--open open" : ""}`}>
        {user ? (
          <>
            <button className="navbar__link-btn" onClick={() => { navigate("/my-listings"); closeMenu(); }}>
              My Listings
            </button>
            <button className="navbar__link-btn" onClick={() => { navigate("/add-listing"); closeMenu(); }}>
              Add Listing
            </button>
            <Link to="/messages" onClick={closeMenu} className="navbar__messages-link navbar-messages-link">
              Messages
              {unreadCount > 0 && (
                <span className="navbar__badge navbar-badge" aria-label={`${unreadCount} unread messages`}>
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/history" onClick={closeMenu} className="navbar__link">History</Link>
            <Link to="/wishlist" onClick={closeMenu} className="navbar__link">Wishlist</Link>

            {user?.role === "admin" && (
              <Link to="/admin" onClick={closeMenu} className="navbar__link">Admin</Link>
            )}

            <button className="navbar__link-btn" onClick={() => { navigate("/profile"); closeMenu(); }}>
              Profile
            </button>

            <button className="navbar__logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu} className="navbar__link">Login</Link>
            <Link to="/register" onClick={closeMenu} className="navbar__link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
