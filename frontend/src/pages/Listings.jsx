import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, addFavorite, removeFavorite } = useAuth();
  const navigate = useNavigate();

  // Search/filter state
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");

  // Example categories - replace with your own or fetch from backend
  const categories = [
    "",
    "Electronics",
    "Books",
    "Clothing",
    "Home",
    "Other",
  ];

  const sortOptions = [
    { value: "", label: "Sort By" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "date_newest", label: "Newest" },
    { value: "date_oldest", label: "Oldest" },
  ];

  // Fetch listings from backend with filters
  const fetchListings = async (clear = false) => {
    setLoading(true);
    setError(null);
    try {
      let params = {};
      if (!clear) {
        if (q) params.q = q;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (location) params.location = location;
        if (sort) params.sort = sort;
      }
      const res = await axios.get("/api/listings", { params });
      // Support various backend response shapes
      const items = res.data.items || res.data.listings || res.data.data?.items || res.data.data || [];
      setListings(Array.isArray(items) ? items : []);
    } catch (err) {
      setError("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Filter form handlers
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };
  const handleClearFilters = () => {
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setSort("");
    fetchListings(true);
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      {/* Defensive: show error if listings is not array */}
      {!Array.isArray(listings) && <div style={{ color: 'red' }}>Listings data error: not an array.</div>}
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginRight: 8 }}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat || "All Categories"}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ width: 90, marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: 90, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ marginRight: 8 }}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="submit" style={{ marginRight: 8 }}>Apply Filters</button>
        <button type="button" onClick={handleClearFilters}>Clear Filters</button>
      </form>

      {user && (
        <button onClick={() => navigate("/add-listing")}>Add Listing</button>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {listings.map((listing) => {
          const isFav = user?.favorites?.includes(listing._id);
          return (
            <li
              key={listing._id}
              style={{
                border: "1px solid #ccc",
                margin: "1rem 0",
                padding: "1rem",
                position: "relative",
              }}
            >
              {listing.images && listing.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {listing.images.map((media, idx) =>
                    isVideoMedia(media) ? (
                      <video
                        key={idx}
                        src={resolveMediaUrl(media)}
                        style={{ width: 80, height: 80, borderRadius: 4 }}
                        controls
                      />
                    ) : (
                      <img
                        key={idx}
                        src={resolveMediaUrl(media)}
                        alt={`Listing ${idx + 1}`}
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                      />
                    ),
                  )}
                </div>
              )}
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
                  {/*
                  <button
                    onClick={() => handleDelete(listing._id)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                  */}
                </>
              )}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => navigate(`/listings/${listing._id}`)}>
                  View
                </button>
                {user && (
                  <button
                    aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                    style={{ marginLeft: 12, color: isFav ? "red" : "#888", fontSize: 22, background: "none", border: "none", cursor: "pointer" }}
                    onClick={() =>
                      isFav ? removeFavorite(listing._id) : addFavorite(listing._id)
                    }
                  >
                    {isFav ? "♥" : "♡"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {listings.length === 0 && <div>No listings found.</div>}
    </div>
  );
}

export default Listings;
