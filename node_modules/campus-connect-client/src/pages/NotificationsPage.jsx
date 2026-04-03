import { useEffect, useState } from "react";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.notifications);
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`, {});
      await loadNotifications();
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>Keep up with your activity</h1>
          <p className="helper-text page-subtitle">
            Track request updates, messages, reviews, and badge changes in one stream.
          </p>
        </div>
      </div>
      <InlineNotice tone={feedback.tone} message={feedback.message} />
      <div className="panel">
        {loading ? <p className="helper-text">Loading notifications...</p> : null}
        <div className="stack">
          {notifications.map((notification, index) => (
            <article
              key={notification._id}
              className={`request-card-shell list-item-animate ${notification.isRead ? "" : "unread-notification"}`}
              style={{ "--stagger-index": index }}
            >
              <div className="request-card-header">
                <div>
                  <h2>{notification.title}</h2>
                  <p className="helper-text">{notification.body}</p>
                </div>
                <span className={`status-badge ${notification.isRead ? "" : "status-accepted"}`}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
              </div>
              {!notification.isRead ? (
                <button
                  type="button"
                  className="ghost-button inline-flex"
                  onClick={() => markAsRead(notification._id)}
                >
                  Mark as read
                </button>
              ) : null}
            </article>
          ))}
          {!loading && notifications.length === 0 ? (
            <div className="empty-state subtle-empty-state">
              <p className="helper-text">Your notifications will appear here.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
