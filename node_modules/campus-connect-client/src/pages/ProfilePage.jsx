import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { Avatar } from "../components/Avatar";
import { InlineNotice } from "../components/InlineNotice";
import { ReviewList } from "../components/ReviewList";
import { SkillInput } from "../components/SkillInput";

const initialRequest = {
  projectTitle: "",
  description: "",
  requiredSkills: [],
  requiredRole: "",
  projectType: "",
  customMessage: "",
  urgency: "medium",
  expectedDuration: "",
  deadline: ""
};

export const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [form, setForm] = useState(initialRequest);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await api.get(`/profiles/${userId}`);
        setStudent(response.user);
        setReviews(response.reviews);
        setRatingSummary(response.ratingSummary);
      } catch (error) {
        navigate("/discover", {
          replace: true,
          state: { profileError: error.message }
        });
      }
    };

    loadStudent();
  }, [navigate, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ tone: "info", message: "" });

    if (form.projectTitle.trim().length < 4) {
      setFeedback({ tone: "error", message: "Add a project title with at least 4 characters." });
      return;
    }

    if (form.description.trim().length < 20) {
      setFeedback({
        tone: "error",
        message: "Describe the collaboration in at least 20 characters."
      });
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/requests", {
        receiverId: userId,
        ...form
      });
      setFeedback({ tone: "success", message: "Collaboration request sent." });
      setForm(initialRequest);
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) {
    return <div className="panel empty-state">Loading profile...</div>;
  }

  return (
    <section className="page grid profile-layout">
      <div className="panel profile-overview-card">
        <div className="profile-top">
          <Avatar name={student.name} src={student.avatar} size="large" />
          <div className="profile-heading">
            <h1>{student.name}</h1>
            <p className="helper-text">
              @{student.username} • {student.department} • {student.year} / {student.semester}
            </p>
            <p className="helper-text">
              {student.collegeName} • {student.preferredCollaborationMode}
            </p>
            <p className="helper-text">@{student.githubUsername}</p>
          </div>
        </div>
        <p className="body-copy">{student.bio}</p>
        <div className="pill-row">
          {student.skills.map((skill) => (
            <span className="pill" key={skill}>
              {skill}
            </span>
          ))}
        </div>
        <div className="pill-row">
          {(student.badges ?? []).map((badge) => (
            <span className="pill" key={badge}>
              {badge}
            </span>
          ))}
        </div>
        <p className="helper-text">Availability: {student.availability}</p>
        <p className="helper-text">Completed projects: {student.completedProjectsCount ?? 0}</p>
        <p className="helper-text">
          Reputation {student.reputationScore.toFixed(1)} from {student.reviewCount} reviews
        </p>
        {ratingSummary ? (
          <div className="stack">
            <p className="helper-text">Communication {ratingSummary.communication}/5</p>
            <p className="helper-text">Skill quality {ratingSummary.skillQuality}/5</p>
            <p className="helper-text">Reliability {ratingSummary.reliability}/5</p>
          </div>
        ) : null}
      </div>

      <div className="stack page-section">
        <div className="panel">
          <h2>Send collaboration request</h2>
          <InlineNotice tone={feedback.tone} message={feedback.message} />
          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Project title</span>
              <input
                type="text"
                value={form.projectTitle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectTitle: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Project description</span>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Required role</span>
              <input
                type="text"
                value={form.requiredRole}
                onChange={(event) =>
                  setForm((current) => ({ ...current, requiredRole: event.target.value }))
                }
                placeholder="Frontend developer, designer, ML lead"
              />
            </label>
            <label className="field">
              <span>Project type</span>
              <input
                type="text"
                value={form.projectType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectType: event.target.value }))
                }
                placeholder="Hackathon, assignment, startup MVP"
              />
            </label>
            <label className="field">
              <span>Custom message</span>
              <textarea
                rows="3"
                value={form.customMessage}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customMessage: event.target.value }))
                }
                placeholder="Why you want to collaborate with this student"
              />
            </label>
            <SkillInput
              label="Required skills"
              value={form.requiredSkills}
              onChange={(value) => setForm((current) => ({ ...current, requiredSkills: value }))}
              placeholder="React, API design"
            />
            <div className="form-grid two-up">
              <label className="field">
                <span>Urgency</span>
                <select
                  value={form.urgency}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, urgency: event.target.value }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="field">
                <span>Deadline</span>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, deadline: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Expected duration</span>
              <input
                type="text"
                placeholder="2 weeks, 1 month, weekend sprint"
                value={form.expectedDuration}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expectedDuration: event.target.value }))
                }
              />
            </label>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Sending..." : "Send request"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Recent reviews</h2>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </section>
  );
};
