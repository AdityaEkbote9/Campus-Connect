import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";

const formatStatus = (status) =>
  status
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

export const RequestsPage = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [loading, setLoading] = useState(true);
  const [actioningRequestId, setActioningRequestId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestResponse, sessionResponse] = await Promise.all([
        api.get("/requests"),
        api.get("/sessions")
      ]);
      setIncoming(requestResponse.incoming);
      setOutgoing(requestResponse.outgoing);
      setSessions(sessionResponse.sessions);
    } catch (error) {
      setMessage(error.message);
      setMessageTone("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRequest = async (requestId, status) => {
    try {
      setActioningRequestId(requestId);
      await api.patch(`/requests/${requestId}/status`, { status });
      setMessage(`Request ${formatStatus(status)}.`);
      setMessageTone("success");
      await loadData();
    } catch (error) {
      setMessage(error.message);
      setMessageTone("error");
    } finally {
      setActioningRequestId("");
    }
  };

  return (
    <section className="page stack">
      <div className="panel page-header-card app-hero-card">
        <div>
          <p className="eyebrow">Requests</p>
          <h1>Track requests and project rooms</h1>
          <p className="helper-text page-subtitle">
            Review incoming collaboration asks, watch your outbox, and jump into accepted sessions.
          </p>
        </div>
        <div className="page-summary-grid">
          <div className="page-summary-tile">
            <strong>{incoming.length}</strong>
            <span>Incoming</span>
          </div>
          <div className="page-summary-tile">
            <strong>{outgoing.length}</strong>
            <span>Outgoing</span>
          </div>
          <div className="page-summary-tile">
            <strong>{sessions.length}</strong>
            <span>Project rooms</span>
          </div>
        </div>
      </div>
      <InlineNotice tone={messageTone} message={message} />
      {loading ? <div className="panel empty-state">Loading requests and sessions...</div> : null}
      <div className="grid request-columns">
        <div className="panel">
          <h2>Incoming requests</h2>
          <div className="stack request-list">
            {incoming.map((request, index) => (
              <article
                className="request-card request-card-shell list-item-animate"
                key={request._id}
                style={{ "--stagger-index": index }}
              >
                <div className="request-card-header">
                  <div>
                    <h2>{request.projectTitle}</h2>
                    <p className="helper-text">From {request.senderId?.name}</p>
                  </div>
                  <span className={`status-badge status-${request.status}`}>
                    {formatStatus(request.status)}
                  </span>
                </div>
                <p className="body-copy">{request.description}</p>
                {request.customMessage ? <p className="helper-text">Message: {request.customMessage}</p> : null}
                <div className="request-meta">
                  <p className="helper-text">Role: {request.requiredRole || "Flexible"}</p>
                  <p className="helper-text">Project type: {request.projectType || "General collaboration"}</p>
                  <p className="helper-text">Urgency: {request.urgency}</p>
                  <p className="helper-text">
                    Expected duration: {request.expectedDuration || "Flexible"}
                  </p>
                  <p className="helper-text">
                    Deadline: {request.deadline ? new Date(request.deadline).toLocaleDateString() : "No deadline"}
                  </p>
                  <p className="helper-text">
                    Required: {(request.requiredSkills ?? []).join(", ") || "None"}
                  </p>
                </div>
                <div className="button-row">
                  {request.status === "pending" || request.status === "maybe_later" ? (
                    <>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={actioningRequestId === request._id}
                        onClick={() => updateRequest(request._id, "accepted")}
                      >
                        {actioningRequestId === request._id ? "Processing..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={actioningRequestId === request._id}
                        onClick={() => updateRequest(request._id, "maybe_later")}
                      >
                        {actioningRequestId === request._id ? "Processing..." : "Maybe later"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={actioningRequestId === request._id}
                        onClick={() => updateRequest(request._id, "cancelled")}
                      >
                        {actioningRequestId === request._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <span className={`status-badge status-${request.status}`}>
                      {formatStatus(request.status)}
                    </span>
                  )}
                </div>
              </article>
            ))}
            {incoming.length === 0 ? (
              <div className="empty-state subtle-empty-state">
                <p className="helper-text">No incoming requests yet.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <h2>Outgoing requests</h2>
          <div className="stack request-list">
            {outgoing.map((request, index) => (
              <article
                className="request-card request-card-shell list-item-animate"
                key={request._id}
                style={{ "--stagger-index": index }}
              >
                <div className="request-card-header">
                  <div>
                    <h2>{request.projectTitle}</h2>
                    <p className="helper-text">To {request.receiverId?.name}</p>
                  </div>
                  <span className={`status-badge status-${request.status}`}>
                    {formatStatus(request.status)}
                  </span>
                </div>
                <p className="body-copy">{request.description}</p>
                <div className="request-meta">
                  <p className="helper-text">Role: {request.requiredRole || "Flexible"}</p>
                  <p className="helper-text">Project type: {request.projectType || "General collaboration"}</p>
                  <p className="helper-text">Urgency: {request.urgency}</p>
                  <p className="helper-text">
                    Expected duration: {request.expectedDuration || "Flexible"}
                  </p>
                </div>
                <div className="button-row">
                  {(request.status === "pending" || request.status === "maybe_later") ? (
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={actioningRequestId === request._id}
                      onClick={() => updateRequest(request._id, "cancelled")}
                    >
                      {actioningRequestId === request._id ? "Processing..." : "Cancel"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {outgoing.length === 0 ? (
              <div className="empty-state subtle-empty-state">
                <p className="helper-text">No outgoing requests yet.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Project rooms</h2>
        <div className="grid two-up">
          {sessions.map((session, index) => (
            <article
              className="request-card request-card-shell list-item-animate"
              key={session._id}
              style={{ "--stagger-index": index }}
            >
              <div className="request-card-header">
                <h2>{session.title || session.requestId?.projectTitle}</h2>
                <span className={`status-badge status-${session.status}`}>
                  {formatStatus(session.status)}
                </span>
              </div>
              <p className="helper-text">
                Team: {session.requestId?.senderId?.name} and {session.requestId?.receiverId?.name}
              </p>
              <div className="button-row">
                <Link className="primary-button inline-flex" to={`/sessions/${session._id}`}>
                  Open room
                </Link>
                <Link className="ghost-button inline-flex" to={`/projects/${session._id}`}>
                  Project detail
                </Link>
              </div>
            </article>
          ))}
        </div>
        {sessions.length === 0 ? (
          <div className="empty-state subtle-empty-state">
            <p className="helper-text">Accepted requests will appear here.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
