import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../utils/media";

const Wishlist = () => {
  const { user, favorites, refreshFavorites, removeFavorite } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (user) {
      refreshFavorites().finally(() => {
        if (mounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [refreshFavorites, user]);

  if (loading) {
    return (
      <div className="wishlist page-shell wishlist--centered centered-page-message">
        <div className="wishlist__status-panel status-panel">Loading wishlist...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wishlist page-shell wishlist--centered centered-page-message">
        <div className="wishlist__info-banner info-banner">
          Please <Link to="/login">login</Link> to view your wishlist.
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist page-shell wishlist-page">
      <div className="wishlist__header page-header">
        <div className="wishlist__header-content">
          <span className="wishlist__kicker page-kicker">Saved Items</span>
          <h2 className="wishlist__title">Your Wishlist</h2>
          <p className="wishlist__subtitle page-subtitle">
            Keep track of products you want to revisit, compare, or message sellers about later.
          </p>
        </div>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="wishlist__empty empty-state">Your wishlist is empty.</div>
      ) : (
        <div className="wishlist__listings wishlist-listings">
          {favorites.map((listing) => (
            <div key={listing._id} className="wishlist__card wishlist-card">
              <Link to={`/listings/${listing._id}`} className="wishlist__card-link">
                <img
                  src={
                    listing.images && listing.images.length > 0
                      ? resolveMediaUrl(listing.images[0])
                      : "/default-image.jpg"
                  }
                  alt={listing.title}
                  className="wishlist__image wishlist-image"
                  onError={(e) => {
                    e.currentTarget.src = "/default-image.jpg";
                  }}
                />
                <h3 className="wishlist__card-title">{listing.title}</h3>
              </Link>
              <button className="wishlist__remove-btn" onClick={() => removeFavorite(listing._id)}>
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
