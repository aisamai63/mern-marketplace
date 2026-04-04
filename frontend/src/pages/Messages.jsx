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
      } catch (error) {
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
    } catch (error) {
      toast.error("Failed to mark message as read.");
    } finally {
      setMarkingId("");
    }
  };

  if (loading) {
    return <div className="messages-page">Loading messages...</div>;
  }

  if (!user) {
    return (
      <div className="messages-page">
        Please <Link to="/login">login</Link> to view your messages.
      </div>
    );
  }

  if (!messages.length) {
    return <div className="messages-page">No messages yet.</div>;
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>Your Messages</h2>
        <p>{unreadCount} unread</p>
      </div>

      <div className="messages-list">
        {messages.map((msg) => (
          <article
            key={msg._id}
            className={`message-card${msg.readAt ? "" : " unread"}`}
          >
            <div className="message-card-top">
              <strong>{msg.sender?.name || "Buyer"}</strong>
              <span>{formatDate(msg.createdAt)}</span>
            </div>

            <p className="message-listing-ref">
              About listing:{" "}
              <Link to={`/listings/${msg.listing?._id || ""}`}>
                {msg.listing?.title || "View listing"}
              </Link>
            </p>

            <p className="message-body">{msg.body}</p>

            {!msg.readAt && (
              <button
                className="btn-primary"
                disabled={markingId === msg._id}
                onClick={() => markAsRead(msg._id)}
              >
                {markingId === msg._id ? "Marking..." : "Mark as read"}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
