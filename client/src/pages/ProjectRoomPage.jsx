import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";
import { useAuth } from "../context/AuthContext";

export const ProjectRoomPage = () => {
  const { sessionId } = useParams();
  const { user, refreshUser } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [review, setReview] = useState({
    revieweeId: "",
    rating: 5,
    communication: 5,
    skillQuality: 5,
    reliability: 5,
    timeliness: 5,
    teamwork: 5,
    flagGhosting: false,
    comment: ""
  });
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [completingProject, setCompletingProject] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRoom = async () => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      setSession(response.session);
      setMessages(response.messages);

      const teammateId =
        response.session.requestId.senderId._id === user._id
          ? response.session.requestId.receiverId._id
          : response.session.requestId.senderId._id;

      setReview((current) => ({ ...current, revieweeId: teammateId }));
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    }
  };

  useEffect(() => {
    if (user) {
      loadRoom();
    }
  }, [sessionId, user]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/sessions/${sessionId}/messages`, {
        content: content.trim(),
        type: /^https?:\/\//i.test(content.trim()) ? "link" : "text"
      });
      setContent("");
      setFeedback({ tone: "success", message: "Message sent." });
      await loadRoom();
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSendingMessage(false);
    }
  };

  const completeProject = async () => {
    try {
      setCompletingProject(true);
      await api.patch(`/sessions/${sessionId}/complete`, {});
      setFeedback({ tone: "success", message: "Project marked complete." });
      await loadRoom();
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setCompletingProject(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    try {
      setSubmittingReview(true);
      await api.post("/reviews", {
        projectSessionId: sessionId,
        ...review
      });
      await refreshUser();
      setFeedback({ tone: "success", message: "Review submitted." });
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!session) {
    return <div className="panel">Loading project room...</div>;
  }

  const teammate =
    session.requestId.senderId._id === user._id
      ? session.requestId.receiverId
      : session.requestId.senderId;

  return (
    <section className="page grid project-layout">
      <div className="panel">
        <p className="eyebrow">Project room</p>
        <h1>{session.title || session.requestId.projectTitle}</h1>
        <InlineNotice tone={feedback.tone} message={feedback.message} />
        <p>{session.description || session.requestId.description}</p>
        <p className="helper-text">Teammate: {teammate.name}</p>
        <p className="helper-text">
          Status: {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </p>
        <p className="helper-text">
          Required role: {session.requestId.requiredRole || "Flexible"}
        </p>
        <p className="helper-text">
          Required skills: {session.requestId.requiredSkills?.join(", ") || "No specific skills listed"}
        </p>
        <p className="helper-text">
          Timeline: {session.timeline || session.requestId.expectedDuration || "Flexible / not specified"}
        </p>
        <p className="helper-text">
          Resources: {session.sharedResources?.length ? session.sharedResources.length : 0}
        </p>
        <div className="button-row">
          {session.status === "active" ? (
            <button
              type="button"
              className="primary-button"
              disabled={completingProject}
              onClick={completeProject}
            >
              {completingProject ? "Completing..." : "Mark project complete"}
            </button>
          ) : null}
          <Link className="ghost-button inline-flex" to={`/projects/${session._id}`}>
            Manage project
          </Link>
        </div>
      </div>

      <div className="panel">
        <h2>Project chat</h2>
        <div className="chat-log">
          {messages.map((message) => (
            <div
              key={message._id}
              className={message.senderId._id === user._id ? "chat-bubble own" : "chat-bubble"}
            >
              <div className="message-meta-row">
                <strong>{message.senderId.name}</strong>
                <div className="button-row">
                  {message.type !== "text" ? <span className="pill">{message.type}</span> : null}
                  {message.isPinned ? <span className="pill">Pinned</span> : null}
                </div>
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Share an update, repo link, or important requirement..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={session.status !== "active" || sendingMessage}
          />
          <button
            type="submit"
            className="primary-button"
            disabled={session.status !== "active" || sendingMessage}
          >
            {sendingMessage ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Leave a review</h2>
        <p className="helper-text">Reviews are enabled after the project is marked complete.</p>
        <form className="stack" onSubmit={submitReview}>
          <div className="form-grid two-up">
            <label className="field">
              <span>Overall rating</span>
              <select
                value={review.rating}
                onChange={(event) =>
                  setReview((current) => ({ ...current, rating: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label className="field">
              <span>Communication</span>
              <select
                value={review.communication}
                onChange={(event) =>
                  setReview((current) => ({ ...current, communication: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label className="field">
              <span>Skill quality</span>
              <select
                value={review.skillQuality}
                onChange={(event) =>
                  setReview((current) => ({ ...current, skillQuality: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label className="field">
              <span>Reliability</span>
              <select
                value={review.reliability}
                onChange={(event) =>
                  setReview((current) => ({ ...current, reliability: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label className="field">
              <span>Timeliness</span>
              <select
                value={review.timeliness}
                onChange={(event) =>
                  setReview((current) => ({ ...current, timeliness: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
            <label className="field">
              <span>Teamwork</span>
              <select
                value={review.teamwork}
                onChange={(event) =>
                  setReview((current) => ({ ...current, teamwork: Number(event.target.value) }))
                }
                disabled={session.status !== "completed"}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
          </div>
          <label className="field checkbox-field">
            <span>Flag ghosting or severe non-responsiveness</span>
            <input
              type="checkbox"
              checked={review.flagGhosting}
              onChange={(event) =>
                setReview((current) => ({ ...current, flagGhosting: event.target.checked }))
              }
              disabled={session.status !== "completed"}
            />
          </label>
          <label className="field">
            <span>Comment</span>
            <textarea
              rows="4"
              value={review.comment}
              onChange={(event) =>
                setReview((current) => ({ ...current, comment: event.target.value }))
              }
              disabled={session.status !== "completed"}
            />
          </label>
          <button
            type="submit"
            className="primary-button"
            disabled={session.status !== "completed" || submittingReview}
          >
            {submittingReview ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </section>
  );
};
