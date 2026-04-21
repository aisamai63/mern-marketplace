import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";
import SafeImage from "../components/SafeImage";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, addFavorite, removeFavorite } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");

  const categories = ["", "Electronics", "Books", "Clothing", "Home", "Other"];

  const sortOptions = [
    { value: "", label: "Sort By" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "date_newest", label: "Newest" },
    { value: "date_oldest", label: "Oldest" },
  ];

  const fetchListings = async (clear = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (!clear) {
        if (q) params.q = q;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (location) params.location = location;
        if (sort) params.sort = sort;
      }
      const res = await api.get("/api/listings", { params });
      const items =
        res.data.items ||
        res.data.listings ||
        res.data.data?.items ||
        res.data.data ||
        [];
      setListings(Array.isArray(items) ? items : []);
    } catch (_) {
      setError("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

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
    <div className="listings page-shell listings-page">
      <div className="page-header">
        <div>
          {/* <span className="page-kicker">Marketplace</span> */}
          <h1>Browse Listings</h1>
          <p className="page-subtitle">
            Discover products nearby, filter quickly, and jump into the details that matter.
          </p>
        </div>
      </div>

      <form onSubmit={handleFilterSubmit} className="listings__filter-form filter-form">
        <input
          type="text"
          className="listings__search-input"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="listings__category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat || "All Categories"}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="listings__min-price-input price-input"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          className="listings__max-price-input price-input"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="text"
          className="listings__location-input"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select className="listings__sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button type="submit" className="listings__apply-btn btn-primary">
          Apply Filters
        </button>
        <button type="button" className="listings__clear-btn" onClick={handleClearFilters}>
          Clear
        </button>
      </form>

      {user && (
        <button
          className="listings__add-btn btn-primary add-listing-btn"
          onClick={() => navigate("/add-listing")}
        >
          + Add Listing
        </button>
      )}

      {loading && <div className="listings__loading listings-loading">Loading listings...</div>}
      {error && <div className="listings__error listings-error">{error}</div>}

      {!loading && !error && listings.length === 0 && (
        <div className="listings__empty listings-empty">No listings found.</div>
      )}

      <div className="listings__grid listings-grid">
        {listings.map((listing) => {
          const isFav = user?.favorites?.some(
            (fav) => (fav?._id || fav) === listing._id,
          );

          const ownerId =
            typeof listing.user === "object"
              ? listing.user?._id || listing.user?.id
              : listing.user;

          const canEdit =
            user && ownerId && String(ownerId) === String(user._id || user.id);

          return (
            <div
              key={listing._id}
              className="listings__card listing-card"
              onClick={(e) => {
                if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
                  return;
                }
                navigate(`/listings/${listing._id}`);
              }}
            >
              {listing.images && listing.images.length > 0 && (
                <div className="listing-card-media">
                  {isVideoMedia(listing.images[0]) ? (
                    <video
                      src={resolveMediaUrl(listing.images[0])}
                      className="listing-card-thumb"
                      controls
                    />
                  ) : (
                    <SafeImage
                      media={listing.images[0]}
                      title={listing.title}
                      seed={listing._id}
                      alt={listing.title}
                      className="listing-card-thumb"
                    />
                  )}
                </div>
              )}

              <div className="listing-card-body">
                <h3 className="listing-card-title">{listing.title}</h3>
                <p className="listing-card-desc">{listing.description}</p>
                <p className="listing-card-price">${listing.price}</p>

                <div className="listing-card-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listings/${listing._id}`);
                    }}
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-listing/${listing._id}`);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {user && (
                    <button
                      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                      className={`btn-fav${isFav ? " active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        isFav
                          ? removeFavorite(listing._id)
                          : addFavorite(listing._id);
                      }}
                    >
                      {isFav ? "♥" : "♡"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Listings;
