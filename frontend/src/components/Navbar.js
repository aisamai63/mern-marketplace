import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/listings" style={{ marginRight: "1rem" }}>
        Marketplace
      </Link>
      {user ? (
        <>
          <button
            onClick={() => navigate("/add-listing")}
            style={{ marginRight: "1rem" }}
          >
            Add Listing
          </button>
          <button onClick={handleLogout} style={{ marginRight: "1rem" }}>
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;
