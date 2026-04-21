import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", profilePicture: "" });
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    api
      .get("/api/users/me")
      .then((res) => {
        setProfile(res.data.data);
        setForm({
          name: res.data.data.name,
          email: res.data.data.email,
          profilePicture: res.data.data.profilePicture || "",
        });
      })
      .catch(() => setError("Failed to load profile"));

    api.get("/api/listings/me").then((res) => {
      const items =
        res.data?.data?.items ||
        res.data?.items ||
        res.data?.listings ||
        res.data?.data ||
        [];
      if (Array.isArray(items)) {
        setListings(items);
      }
    });
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.put("/api/users/me", form);
      setProfile(res.data.data);
      updateUser(res.data.data);
      setEdit(false);
    } catch (_) {
      setError("Update failed");
    }
  };

  if (!user) {
    return (
      <div className="profile page-shell profile--centered centered-page-message">
        <div className="profile__info-banner info-banner">Please log in to view your profile.</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile page-shell profile--centered centered-page-message">
        <div className="profile__status-panel status-panel">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile page-shell profile-page page-shell--narrow">
      <div className="profile__header page-header">
        <div className="profile__header-content">
          <span className="profile__kicker page-kicker">Account</span>
          <h2 className="profile__title">My Profile</h2>
          <p className="profile__subtitle page-subtitle">
            Keep your identity, contact details, and seller presence up to date.
          </p>
        </div>
      </div>

      <div className="profile__summary profile-summary">
        <div className="profile__copy profile-copy">
          {profile.profilePicture && (
            <img src={profile.profilePicture} alt="Profile" className="profile__avatar profile-avatar" />
          )}
          {!edit && (
            <>
              <p className="profile__name"><b>Name:</b> {profile.name}</p>
              <p className="profile__email"><b>Email:</b> {profile.email}</p>
            </>
          )}
        </div>

        {!edit && (
          <button className="profile__edit-btn btn-primary" onClick={() => setEdit(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {edit && (
        <form onSubmit={handleSubmit} className="profile__form listing-form">
          <div className="profile__form-group form-group">
            <label className="profile__form-label">Name</label>
            <input className="profile__form-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="profile__form-group form-group">
            <label className="profile__form-label">Email</label>
            <input className="profile__form-input" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="profile__form-group form-group">
            <label className="profile__form-label">Profile Picture URL</label>
            <input
              className="profile__form-input"
              name="profilePicture"
              value={form.profilePicture}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          {form.profilePicture && (
            <img
              src={form.profilePicture}
              alt="Preview"
              className="profile__avatar profile-avatar"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {error && <div className="profile__form-error form-error">{error}</div>}
          <div className="profile__form-actions form-actions">
            <button type="submit" className="profile__save-btn btn-primary">
              Save
            </button>
            <button type="button" className="profile__cancel-btn" onClick={() => setEdit(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <hr className="profile__divider section-divider" />

      <div className="profile__listings-header page-header">
        <div className="profile__listings-header-content">
          <h3 className="profile__listings-title">My Listings</h3>
          <p className="profile__listings-subtitle page-subtitle">Quick access to your current published items.</p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="profile__empty-listings empty-state">No listings yet.</div>
      ) : (
        <ul className="profile__listings profile-listings">
          {listings.map((listing) => (
            <li key={listing._id} className="profile__listing-item profile-listing-item">
              <span className="profile__listing-info">
                <b>{listing.title}</b> - {listing.status} - ${listing.price}
              </span>
              <button className="profile__listing-edit-btn" onClick={() => navigate(`/edit-listing/${listing._id}`)}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile;
