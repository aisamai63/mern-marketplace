import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";
import SafeImage from "../components/SafeImage";
import Reviews from "../components/Reviews";
import { useAuth } from "../context/AuthContext";
import toast from "../utils/toast";
import api from "../utils/api";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, addFavorite, removeFavorite } = useAuth();
  const [contactMsg, setContactMsg] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/listings/${id}`);
        setListing(res.data?.data || res.data);
      } catch (_) {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="listing-details page-shell listing-details--centered centered-page-message">
        <div className="listing-details__status-panel status-panel">Loading listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="listing-details page-shell listing-details--centered centered-page-message">
        <div className="listing-details__empty-state empty-state">Listing not found.</div>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  const isFav = user?.favorites?.some((fav) => (fav._id || fav) === listing._id);

  const userId = user?._id || user?.id;
  const listingOwnerId =
    typeof listing.user === "object"
      ? listing.user?._id || listing.user?.id
      : listing.user;
  const isOwner = Boolean(
    userId && listingOwnerId && String(userId) === String(listingOwnerId),
  );

  return (
    <div className="listing-details page-shell listing-details--stack stack">
      <div className="listing-details__header page-header">
        <div className="listing-details__header-content">
          <span className="listing-details__kicker page-kicker">Listing Details</span>
          <h1 className="listing-details__title">{listing.title}</h1>
          <p className="listing-details__subtitle page-subtitle">{listing.description}</p>
        </div>
      </div>

      <div className="listing-details__layout listing-details-layout">
        <section className="listing-details__gallery surface-card listing-gallery">
          {images.length > 0 ? (
            <div className="listing-details__media-grid listing-media-grid">
              {images.map((media, idx) =>
                isVideoMedia(media) ? (
                  <video
                    key={idx}
                    src={resolveMediaUrl(media)}
                    className="listing-details__media-item listing-media-item"
                    controls
                  />
                ) : (
                  <SafeImage
                    key={idx}
                    media={media}
                    title={listing.title}
                    seed={`${listing._id}-${idx}`}
                    alt={`${listing.title} ${idx + 1}`}
                    className="listing-details__media-item listing-media-item"
                  />
                ),
              )}
            </div>
          ) : (
            <div className="listing-details__empty-media empty-state">No media uploaded for this listing yet.</div>
          )}

          <div className="listing-details__about stack">
            <h3 className="listing-details__about-title">About this item</h3>
            <p className="listing-details__description listing-description">{listing.description}</p>
          </div>
        </section>

        <aside className="listing-details__sidebar surface-card listing-sidebar-card">
          <div className="listing-details__price listing-price">${listing.price}</div>

          <div className="listing-details__meta meta-grid">
            <div className="listing-details__meta-item meta-item">
              <span className="listing-details__meta-label meta-label">Location</span>
              <span className="listing-details__meta-value meta-value">{listing.location || "Not specified"}</span>
            </div>
            <div className="listing-details__meta-item meta-item">
              <span className="listing-details__meta-label meta-label">Status</span>
              <span className="listing-details__meta-value meta-value">{listing.status || "Active"}</span>
            </div>
            <div className="listing-details__meta-item meta-item">
              <span className="listing-details__meta-label meta-label">Rating</span>
              <span className="listing-details__meta-value meta-value">
                {listing.averageRating || 0} / 5
              </span>
            </div>
            <div className="listing-details__meta-item meta-item">
              <span className="listing-details__meta-label meta-label">Reviews</span>
              <span className="listing-details__meta-value meta-value">{listing.reviewsCount || 0}</span>
            </div>
          </div>

          {user && (
            <button
              type="button"
              className={`listing-details__wishlist-toggle wishlist-toggle ${isFav ? "btn-secondary" : "btn-primary"}`}
              aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
              onClick={async () => {
                if (isFav) {
                  removeFavorite(listing._id);
                } else {
                  await addFavorite(listing._id);
                }
              }}
            >
              <span className="listing-details__wishlist-icon">{isFav ? "♥" : "♡"}</span>
              <span className="listing-details__wishlist-label">{isFav ? "Saved to Wishlist" : "Save to Wishlist"}</span>
            </button>
          )}

          <div className="listing-details__contact-panel contact-panel">
            <h3 className="listing-details__contact-title">Contact Seller</h3>

            {!user && (
              <div className="listing-details__info-banner info-banner">
                Please <Link to="/login">log in</Link> to send an inquiry to the seller.
              </div>
            )}

            {user && isOwner && (
              <div className="listing-details__info-banner info-banner">
                This is your listing. The contact form is available only to buyers.
              </div>
            )}

            {user && isOwner && (
              <button
                type="button"
                className="listing-details__delete-btn"
                disabled={deleteLoading}
                onClick={async () => {
                  if (!window.confirm("Delete this listing? This action cannot be undone.")) {
                    return;
                  }

                  setDeleteLoading(true);
                  try {
                    await api.delete(`/api/listings/${listing._id}`);
                    toast.success("Listing deleted.");
                    navigate("/my-listings");
                  } catch (err) {
                    toast.error(err?.response?.data?.message || "Failed to delete listing.");
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? "Deleting..." : "Delete Listing"}
              </button>
            )}

            {user && !isOwner && (
              <form
                className="listing-details__contact-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!contactMsg.trim()) {
                    toast.error("Please enter your message.");
                    return;
                  }

                  setContactLoading(true);
                  try {
                    await api.post(`/api/listings/${listing._id}/contact`, {
                      message: contactMsg,
                    });
                    toast.success("Inquiry sent to the seller!");
                    setContactMsg("");
                  } catch (err) {
                    toast.error(
                      err?.response?.data?.message || "Failed to send inquiry.",
                    );
                  } finally {
                    setContactLoading(false);
                  }
                }}
              >
                <div className="listing-details__form-group form-group">
                  <label className="listing-details__form-label">Your Name</label>
                  <input className="listing-details__form-input" type="text" value={user.name} disabled />
                </div>
                <div className="listing-details__form-group form-group">
                  <label className="listing-details__form-label">Your Email</label>
                  <input className="listing-details__form-input" type="email" value={user.email} disabled />
                </div>
                <div className="listing-details__form-group form-group">
                  <label className="listing-details__form-label">Message</label>
                  <textarea
                    className="listing-details__form-textarea"
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    rows={4}
                    required
                    placeholder="Type your inquiry here..."
                  />
                </div>
                <button type="submit" className="listing-details__submit-btn btn-primary" disabled={contactLoading}>
                  {contactLoading ? "Sending..." : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      <Reviews listingId={id} />
    </div>
  );
}
