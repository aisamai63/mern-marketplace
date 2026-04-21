import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import toast from "../utils/toast";

export default function Reviews({ listingId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editId, setEditId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 5;

  const fetchReviews = async (reset = false, pageNum = page) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/listings/${listingId}/reviews?page=${pageNum}&limit=${PAGE_SIZE}`,
      );
      const items = res.data?.data?.items || [];
      const count = res.data?.data?.count || 0;
      setTotalCount(count);
      if (reset) {
        setReviews(items);
      } else {
        setReviews((prev) => [...prev, ...items]);
      }
      setHasMore(items.length === PAGE_SIZE && pageNum * PAGE_SIZE < count);
    } catch (_) {
      setReviews((prev) => (reset ? [] : prev));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReviews(true, 1);
  }, [listingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.alert("Please login to add a review");
      return;
    }

    try {
      if (editId) {
        await api.put(`/api/listings/${listingId}/reviews/${editId}`, {
          rating: editRating,
          comment: editComment,
        });
        setEditId(null);
        setEditRating(5);
        setEditComment("");
        toast.info("Review updated and sent for admin approval.");
      } else {
        await api.post(`/api/listings/${listingId}/reviews`, { rating, comment });
        setComment("");
        setRating(5);
        toast.info("Review submitted and pending admin approval.");
      }
      setPage(1);
      fetchReviews(true, 1);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to submit review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!user) {
      window.alert("Not authorized");
      return;
    }
    if (!window.confirm("Delete review?")) return;

    try {
      await api.delete(`/api/listings/${listingId}/reviews/${reviewId}`);
      setPage(1);
      fetchReviews(true, 1);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(false, nextPage);
  };

  if (loading && page === 1) {
    return (
      <section className="reviews surface-card reviews-panel">
        <div className="reviews__status-panel status-panel">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section className="reviews surface-card reviews-panel">
      <div className="reviews__header reviews-header">
        <div className="reviews__header-content">
          <h3 className="reviews__title">Reviews</h3>
          <p className="reviews__subtitle page-subtitle">{totalCount} total customer reviews</p>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="reviews__form review-form">
          <div className="reviews__form-top review-form-top">
            <strong className="reviews__form-label">{editId ? "Edit your review" : "Share your experience"}</strong>
            {editId ? (
              <StarRating
                value={editRating}
                onChange={setEditRating}
                readOnly={false}
                size={24}
              />
            ) : (
              <StarRating
                value={rating}
                onChange={setRating}
                readOnly={false}
                size={24}
              />
            )}
          </div>
          <textarea
            className="reviews__textarea"
            value={editId ? editComment : comment}
            onChange={(e) =>
              editId ? setEditComment(e.target.value) : setComment(e.target.value)
            }
            placeholder={editId ? "Edit your review" : "Write a short review"}
            rows={3}
          />
          <div className="reviews__actions review-card-actions">
            <button type="submit" className="reviews__submit-btn btn-primary">
              {editId ? "Update Review" : "Submit Review"}
            </button>
            {editId && (
              <button
                type="button"
                className="reviews__cancel-btn"
                onClick={() => {
                  setEditId(null);
                  setEditRating(5);
                  setEditComment("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="reviews__empty empty-state">No reviews yet.</div>
      ) : (
        <ul className="reviews__list review-list">
          {reviews.map((review) => {
            const isOwner =
              user && review.user && String(user._id) === String(review.user._id);

            return (
              <li key={review._id} className="reviews__card review-card">
                <div className="reviews__card-top review-card-top">
                  <div className="reviews__author review-author">
                    <strong className="reviews__author-name">{review.user?.name || review.user?.email}</strong>
                    <div className="reviews__date review-date">
                      {new Date(review.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <StarRating value={review.rating} readOnly size={20} />
                </div>

                <p className="reviews__comment review-comment">{review.comment}</p>

                {isOwner && (
                  <div className="reviews__actions review-card-actions">
                    <button type="button" className="reviews__delete-btn" onClick={() => handleDelete(review._id)}>
                      Delete
                    </button>
                    <button
                      type="button"
                      className="reviews__edit-btn btn-secondary"
                      onClick={() => {
                        setEditId(review._id);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <div className="reviews__load-more review-load-more">
          <button type="button" className="reviews__load-more-btn" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
