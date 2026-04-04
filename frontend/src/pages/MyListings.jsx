import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get("/api/listings", { params: { user: user._id } })
      .then(res => {
        const items = res.data.items || res.data.listings || res.data.data?.items || res.data.data || [];
        setListings(Array.isArray(items) ? items : []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load your listings");
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div>Please log in to view your listings.</div>;
  if (loading) return <div>Loading your listings…</div>;
  if (error) return <div>{error}</div>;
  if (listings.length === 0) return <div>You have no listings yet.</div>;

  return (
    <div className="listings-page">
      <h2>My Listings</h2>
      <div className="listings-grid">
        {listings.map(listing => (
          <div key={listing._id} className="listing-card">
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <button onClick={() => navigate(`/edit-listing/${listing._id}`)}>Edit</button>
            <button onClick={() => navigate(`/listings/${listing._id}`)}>View</button>
          </div>
        ))}
      </div>
    </div>
  );
}
