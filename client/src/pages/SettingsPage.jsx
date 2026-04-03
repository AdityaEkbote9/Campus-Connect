import { useEffect, useState } from "react";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";
import { useAuth } from "../context/AuthContext";

export const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState({ unreadCount: 0 });
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications({ unreadCount: response.unreadCount });
      } catch (error) {
        setFeedback({ tone: "error", message: error.message });
      }
    };

    load();
  }, []);

  const refreshProfile = async () => {
    try {
      await refreshUser();
      setFeedback({ tone: "success", message: "Profile and reputation refreshed." });
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Account overview</h1>
          <p className="helper-text page-subtitle">
            Review your account state, profile completion, reputation, and current campus activity.
          </p>
        </div>
      </div>
      <InlineNotice tone={feedback.tone} message={feedback.message} />
      <div className="grid two-up">
        <div className="panel stat-panel">
          <p className="eyebrow">Profile completion</p>
          <h2>{user?.profileCompletionScore ?? 0}%</h2>
          <p>Complete profiles are easier to discover and get better teammate responses.</p>
        </div>
        <div className="panel stat-panel">
          <p className="eyebrow">Unread notifications</p>
          <h2>{notifications.unreadCount}</h2>
          <p>Stay on top of requests, reviews, and teammate messages.</p>
        </div>
      </div>
      <div className="panel">
        <h2>Reputation and badges</h2>
        <p className="helper-text">
          Reputation {user?.reputationScore?.toFixed(1) ?? "0.0"} from {user?.reviewCount ?? 0} reviews
        </p>
        <div className="pill-row">
          {user?.badges?.length ? (
            user.badges.map((badge) => (
              <span className="pill" key={badge}>
                {badge}
              </span>
            ))
          ) : (
            <span className="helper-text">Complete more projects to unlock badges.</span>
          )}
        </div>
        <div className="button-row">
          <button type="button" className="primary-button inline-flex" onClick={refreshProfile}>
            Refresh profile data
          </button>
        </div>
      </div>
    </section>
  );
};
