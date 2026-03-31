import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", profilePicture: "" });
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    // Fetch profile
    axios
      .get("/api/users/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setProfile(res.data.data);
        setForm({
          name: res.data.data.name,
          email: res.data.data.email,
          profilePicture: res.data.data.profilePicture || "",
        });
      })
      .catch(() => setError("Failed to load profile"));
    // Fetch user's listings
    axios
      .get("/api/listings", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data?.data?.items)) {
          setListings(
            res.data.data.items.filter((l) => l.user._id === user._id),
          );
        }
      });
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.put("/api/users/me", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(res.data.data);
      login({ ...user, ...res.data.data }); // update context
      setEdit(false);
    } catch (err) {
      setError("Update failed");
    }
  };

  if (!user) return <div>Please log in to view your profile.</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>My Profile</h2>
      {profile.profilePicture && (
        <img
          src={profile.profilePicture}
          alt="Profile"
          style={{ width: 100, borderRadius: "50%" }}
        />
      )}
      {edit ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Profile Picture URL</label>
            <input
              name="profilePicture"
              value={form.profilePicture}
              onChange={handleChange}
            />
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEdit(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p>
            <b>Name:</b> {profile.name}
          </p>
          <p>
            <b>Email:</b> {profile.email}
          </p>
          <button onClick={() => setEdit(true)}>Edit Profile</button>
        </>
      )}
      <hr />
      <h3>My Listings</h3>
      <ul>
        {listings.map((listing) => (
          <li key={listing._id}>
            <b>{listing.title}</b> - {listing.status} - ${listing.price}
            <button
              onClick={() => navigate(`/edit-listing/${listing._id}`)}
              style={{ marginLeft: 8 }}
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
