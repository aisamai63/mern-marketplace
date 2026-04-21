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

  if (!user) {
    return (
      <div className="history page-shell history--centered centered-page-message">
        <div className="history__info-banner info-banner">Please log in to view your activity history.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history page-shell history--centered centered-page-message">
        <div className="history__status-panel status-panel">Loading activity history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history page-shell history--centered centered-page-message">
        <div className="history__error-banner error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="history page-shell history--narrow page-shell--narrow">
      <div className="history__header page-header">
        <div className="history__header-content">
          <span className="history__kicker page-kicker">Timeline</span>
          <h2 className="history__title">Activity History</h2>
          <p className="history__subtitle page-subtitle">
            Review marketplace activity across listings, purchases, and account updates.
          </p>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="history__empty-state empty-state">No activity recorded yet.</div>
      ) : (
        <ul className="history__list profile-listings">
          {historyItems.map((item) => (
            <li key={item._id} className="history__list-item profile-listing-item">
              <span className="history__action">
                <b>{formatAction(item.action)}</b>
                {item.listing?.title ? `: ${item.listing.title}` : ""}
              </span>
              <span className="history__date">{new Date(item.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
