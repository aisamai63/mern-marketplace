
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";
import Reviews from "../components/Reviews";
import { useAuth } from "../context/AuthContext";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, addFavorite, removeFavorite } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/listings/${id}`);
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
  const isFav = user?.favorites?.includes(listing._id);

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
          onClick={() => (isFav ? removeFavorite(listing._id) : addFavorite(listing._id))}
        >
          {isFav ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
        </button>
      )}

      <Reviews listingId={id} />
    </div>
  );
}
