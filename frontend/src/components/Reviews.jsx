
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

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
      const res = await axios.get(`/api/listings/${listingId}/reviews?page=${pageNum}&limit=${PAGE_SIZE}`);
      const items = res.data?.data?.items || [];
      const count = res.data?.data?.count || 0;
      setTotalCount(count);
      if (reset) {
        setReviews(items);
      } else {
        setReviews((prev) => [...prev, ...items]);
      }
      setHasMore(items.length === PAGE_SIZE && (pageNum * PAGE_SIZE) < count);
    } catch (err) {
      setReviews(reset ? [] : reviews);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReviews(true, 1);
    // eslint-disable-next-line
  }, [listingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to add a review');
    try {
      if (editId) {
        await axios.put(
          `/api/listings/${listingId}/reviews/${editId}`,
          { rating: editRating, comment: editComment },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setEditId(null);
        setEditRating(5);
        setEditComment("");
      } else {
        await axios.post(
          `/api/listings/${listingId}/reviews`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setComment("");
        setRating(5);
      }
      setPage(1);
      fetchReviews(true, 1);
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  const handleDelete = async (revId) => {
    if (!user) return alert('Not authorized');
    if (!window.confirm('Delete review?')) return;
    try {
      await axios.delete(`/api/listings/${listingId}/reviews/${revId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPage(1);
      fetchReviews(true, 1);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(false, nextPage);
  };

  if (loading && page === 1) return <div>Loading reviews...</div>;

  return (
    <div style={{ marginTop: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', background: '#fafbfc', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 20 }}>
      <h3 style={{ marginBottom: 18 }}>Reviews</h3>
      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 18, background: '#fff', borderRadius: 6, padding: 14, boxShadow: '0 1px 4px #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Rating:</span>
            {editId ? (
              <StarRating value={editRating} onChange={setEditRating} readOnly={false} size={24} />
            ) : (
              <StarRating value={rating} onChange={setRating} readOnly={false} size={24} />
            )}
          </div>
          <textarea
            value={editId ? editComment : comment}
            onChange={(e) => editId ? setEditComment(e.target.value) : setComment(e.target.value)}
            placeholder={editId ? "Edit your review" : "Write a short review"}
            rows={3}
            style={{ width: '100%', marginTop: 10, borderRadius: 4, border: '1px solid #ddd', padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>
              {editId ? "Update Review" : "Submit Review"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setEditRating(5); setEditComment(""); }} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Cancel</button>
            )}
          </div>
        </form>
      )}

      {reviews.length === 0 && <div>No reviews yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reviews.map((r) => (
          <li key={r._id} style={{ borderBottom: '1px solid #eee', padding: 12, background: '#fff', borderRadius: 6, marginBottom: 12, boxShadow: '0 1px 4px #f3f3f3' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>{r.user?.name || r.user?.email}</strong>
                <span style={{ marginLeft: 10 }}>
                  <StarRating value={r.rating} readOnly size={20} />
                </span>
              </div>
              {user && r.user && user._id === r.user._id && (
                <span>
                  <button onClick={() => handleDelete(r._id)} style={{ marginLeft: 8, background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => { setEditId(r._id); setEditRating(r.rating); setEditComment(r.comment); }} style={{ marginLeft: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                </span>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 15 }}>{r.comment}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={handleLoadMore} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '8px 24px', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
