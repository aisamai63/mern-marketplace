import React, { useEffect, useState } from "react";
import api from "../utils/api";
import StarRating from "../components/StarRating";

function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState({});
  const [actionError, setActionError] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/listings/reviews/pending");
      const items =
        res.data?.data?.items ||
        res.data?.data ||
        res.data?.reviews ||
        [];
      setReviews(Array.isArray(items) ? items : []);
    } catch (err) {
      setError("Failed to load pending reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (review) => {
    setActionError((prev) => ({ ...prev, [review._id]: "" }));
    try {
      await api.post(
        `/api/listings/${review.listing?._id || review.listing}/reviews/${review._id}/approve`
      );
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      setActionError((prev) => ({
        ...prev,
        [review._id]: err.response?.data?.message || "Approve failed",
      }));
    }
  };

  const handleReject = async (review) => {
    setActionError((prev) => ({ ...prev, [review._id]: "" }));
    const reason = rejectReason[review._id] || "";
    try {
      await api.post(
        `/api/listings/${review.listing?._id || review.listing}/reviews/${review._id}/reject`,
        { reason }
      );
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      setActionError((prev) => ({
        ...prev,
        [review._id]: err.response?.data?.message || "Reject failed",
      }));
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard — Pending Reviews</h2>
      {loading && <div className="admin-loading">Loading pending reviews…</div>}
      {error && <div className="admin-error">{error}</div>}
      {!loading && !error && reviews.length === 0 && (
        <div className="admin-empty">No pending reviews. All caught up! 🎉</div>
      )}
      <ul className="admin-review-list">
        {reviews.map((review) => (
          <li key={review._id} className="admin-review-card">
            <div className="admin-review-header">
              <span className="admin-reviewer">
                {review.user?.name || review.user?.email || "Unknown user"}
              </span>
              <span className="admin-listing-title">
                on <em>{review.listing?.title || review.listing}</em>
              </span>
              <StarRating value={review.rating} readOnly size={18} />
            </div>
            {review.comment && (
              <p className="admin-review-comment">{review.comment}</p>
            )}
            <div className="admin-review-date">
              {new Date(review.createdAt).toLocaleString()}
            </div>
            <div className="admin-review-actions">
              <button
                className="btn-approve"
                onClick={() => handleApprove(review)}
              >
                Approve
              </button>
              <input
                type="text"
                className="reject-reason-input"
                placeholder="Rejection reason (optional)"
                value={rejectReason[review._id] || ""}
                onChange={(e) =>
                  setRejectReason((prev) => ({
                    ...prev,
                    [review._id]: e.target.value,
                  }))
                }
              />
              <button
                className="btn-reject"
                onClick={() => handleReject(review)}
              >
                Reject
              </button>
            </div>
            {actionError[review._id] && (
              <div className="admin-action-error">{actionError[review._id]}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
