import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get("/api/listings");
        if (Array.isArray(res.data)) {
          setListings(res.data);
        } else if (Array.isArray(res.data.listings)) {
          setListings(res.data.listings);
        } else {
          setListings([]);
        }
      } catch (err) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setListings(listings.filter((l) => l._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Listings</h2>
      {user && (
        <button onClick={() => navigate("/add-listing")}>Add Listing</button>
      )}
      <ul>
        {listings.map((listing) => (
          <li
            key={listing._id}
            style={{
              border: "1px solid #ccc",
              margin: "1rem 0",
              padding: "1rem",
            }}
          >
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>Price: ${listing.price}</p>
            <p>Status: {listing.status}</p>
            {user && (
              <>
                <button
                  onClick={() => navigate(`/edit-listing/${listing._id}`)}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(listing._id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Listings;
