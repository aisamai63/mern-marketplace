
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";
import Reviews from "../components/Reviews";
import { useAuth } from "../context/AuthContext";
import toast from "../utils/toast";
import api from "../utils/api";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, addFavorite, removeFavorite } = useAuth();
  const [contactMsg, setContactMsg] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/listings/${id}`);
        setListing(res.data?.data || res.data);
      } catch (err) {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!listing) return <div>Listing not found.</div>;

  // Guard for images
  const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
  const isFav = user?.favorites?.some(fav => (fav._id || fav) === listing._id);

  const userId = user?._id || user?.id;
  const listingOwnerId =
    typeof listing.user === "object"
      ? listing.user?._id || listing.user?.id
      : listing.user;
  const isOwner = Boolean(
    userId && listingOwnerId && String(userId) === String(listingOwnerId),
  );

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p>Price: ${listing.price}</p>
      <p>Location: {listing.location}</p>
      <p>Status: {listing.status}</p>
      <p>
        Rating: {listing.averageRating || 0} ({listing.reviewsCount || 0} reviews)
      </p>
      {images.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {images.map((media, idx) =>
            isVideoMedia(media) ? (
              <video
                key={idx}
                src={resolveMediaUrl(media)}
                style={{ width: 240, height: 180 }}
                controls
              />
            ) : (
              <img
                key={idx}
                src={resolveMediaUrl(media)}
                alt={`media-${idx}`}
                style={{ width: 240, height: 180, objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            ),
          )}
        </div>
      )}


      {user && (
        <button
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          style={{ margin: "12px 0", color: isFav ? "red" : "#888", fontSize: 28, background: "none", border: "none", cursor: "pointer" }}
          onClick={async () => {
            if (isFav) {
              removeFavorite(listing._id);
            } else {
              await addFavorite(listing._id);
            }
          }}
        >
          {isFav ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
        </button>
      )}

      <div style={{ margin: "2rem 0", padding: 16, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <h3>Contact Seller</h3>

        {!user && (
          <p>
            Please <Link to="/login">log in</Link> to send an inquiry to the seller.
          </p>
        )}

        {user && isOwner && (
          <p>This is your listing. Contact form is only available to buyers.</p>
        )}

        {user && !isOwner && (
          <form
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
                toast.error(err?.response?.data?.message || "Failed to send inquiry.");
              } finally {
                setContactLoading(false);
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div>
              <label>Your Name</label>
              <input type="text" value={user.name} disabled />
            </div>
            <div>
              <label>Your Email</label>
              <input type="email" value={user.email} disabled />
            </div>
            <div>
              <label>Message</label>
              <textarea
                value={contactMsg}
                onChange={e => setContactMsg(e.target.value)}
                rows={4}
                required
                placeholder="Type your inquiry here..."
              />
            </div>
            <button type="submit" className="btn-primary" disabled={contactLoading}>
              {contactLoading ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        )}
      </div>

      <Reviews listingId={id} />
    </div>
  );
}
