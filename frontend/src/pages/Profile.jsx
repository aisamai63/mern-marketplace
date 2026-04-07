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

    api
      .get("/api/listings/me")
      .then((res) => {
        const items = res.data?.data?.items;
        if (Array.isArray(items)) {
          setListings(items);
        }
      });
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.put("/api/users/me", form);
      setProfile(res.data.data);
      updateUser(res.data.data); // sync name/picture into AuthContext immediately
      setEdit(false);
    } catch (err) {
      setError("Update failed");
    }
  };

  if (!user) return <div>Please log in to view your profile.</div>;
  if (!profile) return <div>Loading…</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      {profile.profilePicture && (
        <img
          src={profile.profilePicture}
          alt="Profile"
          className="profile-avatar"
        />
      )}
      {edit ? (
        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Profile Picture URL</label>
            <input
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
              className="profile-avatar"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Email:</b> {profile.email}</p>
          <button className="btn-primary" onClick={() => setEdit(true)}>Edit Profile</button>
        </>
      )}
      <hr />
      <h3>My Listings</h3>
      {listings.length === 0 && <p>No listings yet.</p>}
      <ul className="profile-listings">
        {listings.map((listing) => (
          <li key={listing._id} className="profile-listing-item">
            <span>
              <b>{listing.title}</b> — {listing.status} — ${listing.price}
            </span>
            <button
              onClick={() => navigate(`/edit-listing/${listing._id}`)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;
