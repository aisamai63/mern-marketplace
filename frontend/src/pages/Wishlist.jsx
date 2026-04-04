
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';


const Wishlist = () => {
  const { user, favorites, refreshFavorites, removeFavorite } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (user) {
      refreshFavorites().finally(() => { if (mounted) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [refreshFavorites, user]);

  if (loading) return <div>Loading wishlist...</div>;
  if (!user) return <div>Please <Link to="/login">login</Link> to view your wishlist.</div>;
  if (!favorites || favorites.length === 0) return <div>Your wishlist is empty.</div>;

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>
      <div className="wishlist-listings">
        {favorites.map(listing => (
          <div key={listing._id} className="wishlist-card">
            <Link to={`/listings/${listing._id}`}>
              <img
                src={listing.images && listing.images.length > 0 ? listing.images[0] : '/default-image.jpg'}
                alt={listing.title}
                className="wishlist-image"
                onError={e => { e.target.src = '/default-image.jpg'; }}
              />
              <h3>{listing.title}</h3>
            </Link>
            <button onClick={() => removeFavorite(listing._id)}>
              Remove from Wishlist
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
