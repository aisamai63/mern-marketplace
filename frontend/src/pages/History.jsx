import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ACTION_LABELS = {
  created_listing: "Created listing",
  updated_listing: "Updated listing",
  deleted_listing: "Deleted listing",
  purchased: "Purchased",
  sold: "Sold",
};

function formatAction(action) {
  return ACTION_LABELS[action] || action;
}

function History() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/users/history");
        const items = res.data?.data?.items;
        if (mounted) {
          setHistoryItems(Array.isArray(items) ? items : []);
        }
      } catch (_) {
        if (mounted) {
          setError("Failed to load activity history.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) return <div>Please log in to view your activity history.</div>;
  if (loading) return <div>Loading activity history...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-page">
      <h2>Activity History</h2>
      {historyItems.length === 0 && <p>No activity recorded yet.</p>}
      <ul className="profile-listings">
        {historyItems.map((item) => (
          <li key={item._id} className="profile-listing-item">
            <span>
              <b>{formatAction(item.action)}</b>
              {item.listing?.title ? `: ${item.listing.title}` : ""}
            </span>
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;
