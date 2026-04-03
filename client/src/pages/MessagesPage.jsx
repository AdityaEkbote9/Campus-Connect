import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";
import { useAuth } from "../context/AuthContext";

const formatStatus = (status) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "No active project";

export const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async (preferredConversationId) => {
    setLoading(true);
    try {
      const response = await api.get("/conversations");
      setConversations(response.conversations);
      const nextConversationId =
        preferredConversationId || response.conversations[0]?._id || "";
      setSelectedConversationId(nextConversationId);
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) {
        setSelectedConversation(null);
        setMessages([]);
        return;
      }

      try {
        const response = await api.get(`/conversations/${selectedConversationId}/messages`);
        setSelectedConversation(response.conversation);
        setMessages(response.messages);
      } catch (error) {
        setFeedback({ tone: "error", message: error.message });
      }
    };

    loadMessages();
  }, [selectedConversationId]);

  const activeSessionId = selectedConversation?.projectSessionId?._id;

  const counterpartName = useMemo(() => {
    if (!selectedConversation || !user) {
      return "";
    }

    const { senderId, receiverId } = selectedConversation.requestId;
    return senderId._id === user._id ? receiverId.name : senderId.name;
  }, [selectedConversation, user]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeSessionId || !content.trim()) {
      return;
    }

    try {
      setSending(true);
      const type = /^https?:\/\//i.test(content.trim()) ? "link" : "text";
      await api.post(`/sessions/${activeSessionId}/messages`, {
        content: content.trim(),
        type
      });
      setContent("");
      setFeedback({ tone: "success", message: "Message sent." });
      await loadConversations(selectedConversationId);
      const response = await api.get(`/conversations/${selectedConversationId}/messages`);
      setSelectedConversation(response.conversation);
      setMessages(response.messages);
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  const togglePin = async (messageId) => {
    try {
      await api.patch(`/conversations/${selectedConversationId}/messages/${messageId}/pin`, {});
      const response = await api.get(`/conversations/${selectedConversationId}/messages`);
      setSelectedConversation(response.conversation);
      setMessages(response.messages);
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    }
  };

  return (
    <section className="page stack">
      <div className="panel page-header-card app-hero-card">
        <div>
          <p className="eyebrow">Messages</p>
          <h1>Stay aligned with your collaborators</h1>
          <p className="helper-text page-subtitle">
            Keep project conversations in one place, share links, and pin the most important notes.
          </p>
        </div>
        <div className="page-summary-row">
          <span className="status-badge status-active">{conversations.length} conversations</span>
          {selectedConversation ? (
            <span className="pill">
              {selectedConversation.projectSessionId?.title || selectedConversation.requestId?.projectTitle}
            </span>
          ) : null}
        </div>
      </div>

      <InlineNotice tone={feedback.tone} message={feedback.message} />

      <div className="grid message-layout">
        <div className="panel">
          <h2>Conversations</h2>
          {loading ? <p className="helper-text">Loading conversations...</p> : null}
          <div className="stack">
            {conversations.map((conversation) => {
              const counterpart =
                conversation.requestId.senderId._id === user?._id
                  ? conversation.requestId.receiverId.name
                  : conversation.requestId.senderId.name;

              return (
                <button
                  key={conversation._id}
                  type="button"
                  className={`conversation-card ${
                    selectedConversationId === conversation._id ? "active-conversation" : ""
                  }`}
                  onClick={() => setSelectedConversationId(conversation._id)}
                >
                  <div>
                    <strong>{conversation.projectSessionId?.title || conversation.requestId.projectTitle}</strong>
                    <p className="helper-text">{counterpart}</p>
                  </div>
                  {conversation.unreadCount ? (
                    <span className="status-badge">{conversation.unreadCount} new</span>
                  ) : null}
                </button>
              );
            })}
            {!loading && conversations.length === 0 ? (
              <div className="empty-state subtle-empty-state">
                <p className="helper-text">Accepted collaborations will appear here.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <h2>{selectedConversation ? counterpartName : "Select a conversation"}</h2>
          <p className="helper-text">
            {selectedConversation
              ? formatStatus(selectedConversation.projectSessionId?.status)
              : "Choose a conversation to view messages."}
          </p>
          <div className="chat-log">
            {messages.map((message) => (
              <div
                key={message._id}
                className={message.senderId._id === user?._id ? "chat-bubble own" : "chat-bubble"}
              >
                <div className="message-meta-row">
                  <strong>{message.senderId.name}</strong>
                  <div className="button-row">
                    {message.isPinned ? <span className="pill">Pinned</span> : null}
                    <button
                      type="button"
                      className="ghost-button small-button"
                      onClick={() => togglePin(message._id)}
                    >
                      {message.isPinned ? "Unpin" : "Pin"}
                    </button>
                  </div>
                </div>
                <p>{message.content}</p>
              </div>
            ))}
            {!selectedConversation ? (
              <div className="empty-state subtle-empty-state">
                <p className="helper-text">Pick a conversation to start chatting.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state subtle-empty-state">
                <p className="helper-text">No messages yet. Send the first project update.</p>
              </div>
            ) : null}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Share an update, repo link, or requirement..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!selectedConversation || sending || selectedConversation.projectSessionId?.status !== "active"}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={!selectedConversation || sending || selectedConversation.projectSessionId?.status !== "active"}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
