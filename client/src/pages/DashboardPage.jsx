import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dashboard/summary");
        setSummary(response);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.completedProfile) {
      loadSummary();
    }
  }, [user]);

  if (!user?.completedProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  const reputationScore = Number.isFinite(user?.reputationScore) ? user.reputationScore : 0;
  const reviewCount = Number.isFinite(user?.reviewCount) ? user.reviewCount : 0;

  const stats = summary?.stats ?? {
    incomingPending: 0,
    outgoingPending: 0,
    activeProjects: 0,
    completedProjects: 0,
    reputationScore,
    reviewCount,
    averageRecentRating: 0,
    unreadNotifications: 0,
    unreadConversations: 0,
    profileCompletionScore: user.profileCompletionScore ?? 0,
    completedProjectsCount: user.completedProjectsCount ?? 0
  };

  return (
    <section className="page dashboard">
      <div className="panel accent dashboard-hero app-hero-card">
        <div className="dashboard-hero-copy">
          <div>
            <p className="eyebrow eyebrow-light">Welcome back</p>
            <h1>{user.name || "Campus student"}</h1>
            <p className="dashboard-hero-text">
              Manage requests, profile quality, notifications, and active campus collaborations from one workspace.
            </p>
          </div>
          <div className="dashboard-hero-summary">
            <span className="dashboard-reputation">
              Reputation {reputationScore.toFixed(1)} · {reviewCount} reviews
            </span>
            <span className="dashboard-reputation">Profile completion {stats.profileCompletionScore}%</span>
            <Link className="secondary-link inline-flex dashboard-hero-link" to="/profile/edit">
              Edit profile
            </Link>
          </div>
        </div>
        <div className="dashboard-hero-grid">
          <div className="dashboard-hero-item">
            <span className="stat-icon">AP</span>
            <strong>{stats.activeProjects}</strong>
            <span>Active</span>
          </div>
          <div className="dashboard-hero-item">
            <span className="stat-icon">RQ</span>
            <strong>{stats.incomingPending + stats.outgoingPending}</strong>
            <span>Requests</span>
          </div>
          <div className="dashboard-hero-item">
            <span className="stat-icon">CP</span>
            <strong>{stats.completedProjects}</strong>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <InlineNotice tone="error" message={errorMessage} />
      {loading ? <div className="panel empty-state">Loading dashboard summary...</div> : null}

      <div className="grid dashboard-stats">
        <div className="panel stat-panel list-item-animate" style={{ "--stagger-index": 0 }}>
          <span className="stat-icon stat-icon-muted">IN</span>
          <p className="eyebrow">Incoming</p>
          <h2>{stats.incomingPending}</h2>
          <p>Collaboration requests waiting for your response.</p>
        </div>
        <div className="panel stat-panel list-item-animate" style={{ "--stagger-index": 1 }}>
          <span className="stat-icon stat-icon-muted">MSG</span>
          <p className="eyebrow">Conversations</p>
          <h2>{stats.unreadConversations}</h2>
          <p>Active collaboration conversations linked to accepted requests.</p>
        </div>
        <div className="panel stat-panel list-item-animate" style={{ "--stagger-index": 2 }}>
          <span className="stat-icon stat-icon-muted">NOTI</span>
          <p className="eyebrow">Notifications</p>
          <h2>{stats.unreadNotifications}</h2>
          <p>Unread request, review, and message alerts in your account.</p>
        </div>
        <div className="panel stat-panel list-item-animate" style={{ "--stagger-index": 3 }}>
          <span className="stat-icon stat-icon-muted">REP</span>
          <p className="eyebrow">Completed</p>
          <h2>{stats.completedProjectsCount}</h2>
          <p>Total completed projects contributing to your reliability and badges.</p>
        </div>
      </div>

      <div className="grid dashboard-content-grid">
        <div className="panel dashboard-card">
          <h2>Discover teammates</h2>
          <p>Use the richer filters to search by skill, department, reliability, and work mode.</p>
          <Link className="primary-button inline-flex" to="/discover">
            Explore students
          </Link>
        </div>
        <div className="panel dashboard-card">
          <h2>Messages and requests</h2>
          <p>Track request decisions and continue accepted collaborations in conversations.</p>
          <div className="button-row">
            <Link className="primary-button inline-flex" to="/requests">
              Open requests
            </Link>
            <Link className="ghost-button inline-flex" to="/messages">
              Open messages
            </Link>
          </div>
        </div>
      </div>

      <div className="panel dashboard-full-width dashboard-card">
        <h2>Keep your profile updated</h2>
        <p>
          Keep your username, semester, links, work mode, and collaboration preferences fresh so the right teammates can find you.
        </p>
        <div className="button-row">
          <Link className="primary-button inline-flex" to="/profile/edit">
            Edit profile
          </Link>
          <Link className="ghost-button inline-flex" to="/settings">
            Open settings
          </Link>
        </div>
      </div>

      <div className="grid dashboard-content-grid">
        <div className="panel dashboard-card">
          <h2>Your strongest skills</h2>
          <div className="pill-row">
            {(summary?.skillHighlights?.length ? summary.skillHighlights : user.skills ?? []).map((skill) => (
              <span className="pill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <div className="pill-row">
            {(user.badges ?? []).map((badge) => (
              <span className="pill" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="panel dashboard-card">
          <h2>Recent activity</h2>
          <div className="stack">
            {summary?.recentRequests?.length ? (
              summary.recentRequests.map((item, index) => (
                <div
                  key={item._id}
                  className="activity-item list-item-animate"
                  style={{ "--stagger-index": index }}
                >
                  <strong>{item.projectTitle}</strong>
                  <span>
                    {item.direction === "incoming" ? "From" : "To"} {item.counterpart} • {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="helper-text">Your recent requests and project updates will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
