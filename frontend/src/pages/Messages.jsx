import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "../utils/toast";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString();
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState("");

  const unreadCount = useMemo(
    () => messages.filter((msg) => !msg.readAt).length,
    [messages],
  );

  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/api/messages");
        const items = res.data?.data?.items || [];
        if (active) {
          setMessages(Array.isArray(items) ? items : []);
        }
      } catch (_) {
        if (active) {
          toast.error("Failed to load messages.");
          setMessages([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      active = false;
    };
  }, [user]);

  const markAsRead = async (messageId) => {
    if (!messageId) return;

    setMarkingId(messageId);
    try {
      await api.patch(`/api/messages/${messageId}/read`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, readAt: msg.readAt || new Date().toISOString() }
            : msg,
        ),
      );
    } catch (_) {
      toast.error("Failed to mark message as read.");
    } finally {
      setMarkingId("");
    }
  };

  if (loading) {
    return (
      <div className="messages page-shell messages--centered centered-page-message">
        <div className="messages__status-panel status-panel">Loading messages...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="messages page-shell messages--centered centered-page-message">
        <div className="messages__info-banner info-banner">
          Please <Link to="/login">login</Link> to view your messages.
        </div>
      </div>
    );
  }

  return (
    <div className="messages page-shell messages-page">
      <div className="messages__header messages-header">
        <div className="messages__header-content">
          <span className="messages__kicker page-kicker">Inbox</span>
          <h2 className="messages__title">Your Messages</h2>
          <p className="messages__subtitle page-subtitle">Buyer and seller conversations in one place.</p>
        </div>
        <p className="messages__unread-count">{unreadCount} unread</p>
      </div>

      {!messages.length ? (
        <div className="messages__empty empty-state">No messages yet.</div>
      ) : (
        <div className="messages__list messages-list">
          {messages.map((msg) => (
            <article
              key={msg._id}
              className={`messages__card message-card${msg.readAt ? "" : " unread"}`}
            >
              <div className="messages__card-top message-card-top">
                <strong className="messages__sender">{msg.sender?.name || "Buyer"}</strong>
                <span className="messages__date">{formatDate(msg.createdAt)}</span>
              </div>

              <p className="messages__listing-ref message-listing-ref">
                About listing: {" "}
                <Link to={`/listings/${msg.listing?._id || ""}`}>
                  {msg.listing?.title || "View listing"}
                </Link>
              </p>

              <p className="messages__body message-body">{msg.body}</p>

              {!msg.readAt && (
                <button
                  className="messages__mark-btn btn-primary"
                  disabled={markingId === msg._id}
                  onClick={() => markAsRead(msg._id)}
                >
                  {markingId === msg._id ? "Marking..." : "Mark as read"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
