import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";
import SafeImage from "../components/SafeImage";
import api from "../utils/api";
import toast from "../utils/toast";

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    api
      .get("/api/listings/me")
      .then((res) => {
        const items =
          res.data.items ||
          res.data.listings ||
          res.data.data?.items ||
          res.data.data ||
          [];
        setListings(Array.isArray(items) ? items : []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load your listings");
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteListing = async (listingId) => {
    if (!listingId) return;
    if (!window.confirm("Delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeletingId(listingId);
    try {
      await api.delete(`/api/listings/${listingId}`);
      setListings((prev) => prev.filter((item) => item._id !== listingId));
      toast.success("Listing deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete listing.");
    } finally {
      setDeletingId("");
    }
  };

  if (!user) {
    return (
      <div className="my-listings page-shell my-listings--centered centered-page-message">
        <div className="my-listings__info-banner info-banner">Please log in to view your listings.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-listings page-shell my-listings--centered centered-page-message">
        <div className="my-listings__status-panel status-panel">Loading your listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-listings page-shell my-listings--centered centered-page-message">
        <div className="my-listings__error-banner error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-listings page-shell listings-page">
      <div className="my-listings__header page-header">
        <div className="my-listings__header-content">
          <span className="my-listings__kicker page-kicker">Seller Space</span>
          <h1 className="my-listings__title">My Listings</h1>
          <p className="my-listings__subtitle page-subtitle">
            Manage your live inventory, update availability, and review each listing before buyers do.
          </p>
        </div>
        <button className="my-listings__add-btn btn-primary" onClick={() => navigate("/add-listing")}>Add New Listing</button>
      </div>

      {listings.length === 0 ? (
        <div className="my-listings__empty empty-state">You have no listings yet.</div>
      ) : (
        <div className="my-listings__grid listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="my-listings__card listing-card">
              {listing.images?.[0] && (
                <div className="my-listings__card-media listing-card-media">
                  {isVideoMedia(listing.images[0]) ? (
                    <video
                      src={resolveMediaUrl(listing.images[0])}
                      className="my-listings__card-thumb listing-card-thumb"
                      controls
                    />
                  ) : (
                    <SafeImage
                      media={listing.images[0]}
                      title={listing.title}
                      seed={listing._id}
                      alt={listing.title}
                      className="my-listings__card-thumb listing-card-thumb"
                    />
                  )}
                </div>
              )}
              <div className="my-listings__card-body listing-card-body">
                <h3 className="my-listings__card-title listing-card-title">{listing.title}</h3>
                <p className="my-listings__card-desc listing-card-desc">{listing.description}</p>
                <p className="my-listings__card-price listing-card-price">${listing.price}</p>
                <div className="my-listings__meta meta-grid">
                  <div className="my-listings__meta-item meta-item">
                    <span className="my-listings__meta-label meta-label">Status</span>
                    <span className="my-listings__meta-value meta-value">{listing.status || "active"}</span>
                  </div>
                  <div className="my-listings__meta-item meta-item">
                    <span className="my-listings__meta-label meta-label">Location</span>
                    <span className="my-listings__meta-value meta-value">
                      {listing.location || "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="my-listings__card-actions listing-card-actions">
                  <button className="my-listings__edit-btn" onClick={() => navigate(`/edit-listing/${listing._id}`)}>
                    Edit
                  </button>
                  <button
                    className="my-listings__view-btn btn-secondary"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="my-listings__delete-btn"
                    onClick={() => handleDeleteListing(listing._id)}
                    disabled={deletingId === listing._id}
                  >
                    {deletingId === listing._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
