import React, { useEffect, useState } from "react";
import api from "../utils/api";
import StarRating from "../components/StarRating";

const TABS = {
  REVIEWS: "reviews",
  USERS: "users",
  LISTINGS: "listings",
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(TABS.REVIEWS);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [rejectReason, setRejectReason] = useState({});
  const [reviewActionError, setReviewActionError] = useState({});

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingError, setListingError] = useState("");

  const fetchPendingReviews = async () => {
    setLoadingReviews(true);
    setReviewError("");
    try {
      const res = await api.get("/api/listings/reviews/pending");
      const items = res.data?.data?.items || res.data?.data || [];
      setReviews(Array.isArray(items) ? items : []);
    } catch (_) {
      setReviewError("Failed to load pending reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError("");
    try {
      const res = await api.get("/api/admin/users");
      setUsers(Array.isArray(res.data?.data?.items) ? res.data.data.items : []);
    } catch (_) {
      setUserError("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    setListingError("");
    try {
      const res = await api.get("/api/admin/listings", { params: { status: "all" } });
      setListings(Array.isArray(res.data?.data?.items) ? res.data.data.items : []);
    } catch (_) {
      setListingError("Failed to load listings.");
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
    fetchUsers();
    fetchListings();
  }, []);

  const handleApprove = async (review) => {
    setReviewActionError((prev) => ({ ...prev, [review._id]: "" }));
    try {
      await api.post(
        `/api/listings/${review.listing?._id || review.listing}/reviews/${review._id}/approve`,
      );
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      setReviewActionError((prev) => ({
        ...prev,
        [review._id]: err.response?.data?.message || "Approve failed",
      }));
    }
  };

  const handleReject = async (review) => {
    setReviewActionError((prev) => ({ ...prev, [review._id]: "" }));
    const reason = rejectReason[review._id] || "";
    try {
      await api.post(
        `/api/listings/${review.listing?._id || review.listing}/reviews/${review._id}/reject`,
        { reason },
      );
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      setReviewActionError((prev) => ({
        ...prev,
        [review._id]: err.response?.data?.message || "Reject failed",
      }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user and related records?")) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((item) => item._id !== userId));
    } catch (err) {
      setUserError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleRoleChange = async (userId, role) => {
    setUserError("");
    try {
      const res = await api.patch(`/api/admin/users/${userId}/role`, { role });
      const updated = res.data?.data;
      setUsers((prev) =>
        prev.map((item) => (item._id === userId ? { ...item, role: updated?.role || role } : item)),
      );
    } catch (err) {
      setUserError(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Delete this listing and related records?")) return;

    try {
      await api.delete(`/api/admin/listings/${listingId}`);
      setListings((prev) => prev.filter((item) => item._id !== listingId));
    } catch (err) {
      setListingError(err.response?.data?.message || "Failed to delete listing.");
    }
  };

  return (
    <div className="admin-dashboard page-shell page-shell--narrow">
      <div className="admin-dashboard__header page-header">
        <div className="admin-dashboard__header-content">
          <span className="admin-dashboard__kicker page-kicker">Moderation</span>
          <h2 className="admin-dashboard__title">Admin Dashboard</h2>
          <p className="admin-dashboard__subtitle page-subtitle">
            Manage platform reviews, users, and listings.
          </p>
        </div>
      </div>

      <div className="admin-dashboard__tabs admin-tabs">
        <button
          className={`admin-tabs__tab ${activeTab === TABS.REVIEWS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.REVIEWS)}
        >
          Reviews
        </button>
        <button
          className={`admin-tabs__tab ${activeTab === TABS.USERS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.USERS)}
        >
          Users
        </button>
        <button
          className={`admin-tabs__tab ${activeTab === TABS.LISTINGS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.LISTINGS)}
        >
          Listings
        </button>
      </div>

      {activeTab === TABS.REVIEWS && (
        <>
          {loadingReviews && <div className="admin-dashboard__loading admin-loading">Loading pending reviews...</div>}
          {reviewError && <div className="admin-dashboard__error admin-error">{reviewError}</div>}
          {!loadingReviews && !reviewError && reviews.length === 0 && (
            <div className="admin-dashboard__empty admin-empty">No pending reviews. All caught up!</div>
          )}

          <ul className="admin-dashboard__review-list admin-review-list">
            {reviews.map((review) => (
              <li key={review._id} className="admin-dashboard__review-card admin-review-card">
                <div className="admin-dashboard__review-header admin-review-header">
                  <span className="admin-dashboard__reviewer admin-reviewer">
                    {review.user?.name || review.user?.email || "Unknown user"}
                  </span>
                  <span className="admin-dashboard__listing-title admin-listing-title">
                    on <em>{review.listing?.title || review.listing}</em>
                  </span>
                  <StarRating value={review.rating} readOnly size={18} />
                </div>

                {review.comment && (
                  <p className="admin-dashboard__review-comment admin-review-comment">{review.comment}</p>
                )}

                <div className="admin-dashboard__review-date admin-review-date">
                  {new Date(review.createdAt).toLocaleString()}
                </div>

                <div className="admin-dashboard__review-actions admin-review-actions">
                  <button className="admin-dashboard__btn-approve btn-approve" onClick={() => handleApprove(review)}>
                    Approve
                  </button>
                  <input
                    type="text"
                    className="admin-dashboard__reject-reason-input reject-reason-input"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason[review._id] || ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({
                        ...prev,
                        [review._id]: e.target.value,
                      }))
                    }
                  />
                  <button className="admin-dashboard__btn-reject btn-reject" onClick={() => handleReject(review)}>
                    Reject
                  </button>
                </div>

                {reviewActionError[review._id] && (
                  <div className="admin-dashboard__action-error admin-action-error">
                    {reviewActionError[review._id]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === TABS.USERS && (
        <>
          {loadingUsers && <div className="admin-loading">Loading users...</div>}
          {userError && <div className="admin-error">{userError}</div>}
          {!loadingUsers && !users.length && <div className="admin-empty">No users found.</div>}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name || "-"}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="admin-role-select"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn-reject" onClick={() => handleDeleteUser(user._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === TABS.LISTINGS && (
        <>
          {loadingListings && <div className="admin-loading">Loading listings...</div>}
          {listingError && <div className="admin-error">{listingError}</div>}
          {!loadingListings && !listings.length && <div className="admin-empty">No listings found.</div>}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing._id}>
                    <td>{listing.title}</td>
                    <td>{listing.user?.email || listing.user?.name || "-"}</td>
                    <td>{listing.status}</td>
                    <td>${listing.price}</td>
                    <td>
                      <button className="btn-reject" onClick={() => handleDeleteListing(listing._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
