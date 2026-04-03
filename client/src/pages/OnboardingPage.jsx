import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";
import { SkillInput } from "../components/SkillInput";
import { useAuth } from "../context/AuthContext";

const parseListText = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const OnboardingPage = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    collegeName: "",
    githubUsername: "",
    department: "",
    year: "",
    semester: "",
    bio: "",
    skills: [],
    preferredProjectTypes: [],
    links: [],
    preferredCollaborationMode: "hybrid",
    availability: ""
  });
  const [linksText, setLinksText] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ tone: "error", message: "" });

  const isEditMode = location.pathname === "/profile/edit" || Boolean(user?.completedProfile);
  const pageTitle = isEditMode ? "Edit your student profile" : "Complete your student profile";
  const pageDescription = isEditMode
    ? "Update your student profile so classmates see your latest skills, links, and preferences."
    : "Complete your profile before other students can discover and invite you.";

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name ?? "",
      username: user.username ?? "",
      collegeName: user.collegeName ?? "",
      githubUsername: user.githubUsername ?? "",
      department: user.department ?? "",
      year: user.year ?? "",
      semester: user.semester ?? "",
      bio: user.bio ?? "",
      skills: user.skills ?? [],
      preferredProjectTypes: user.preferredProjectTypes ?? [],
      links: user.links ?? [],
      preferredCollaborationMode: user.preferredCollaborationMode || "hybrid",
      availability: user.availability ?? ""
    });
    setLinksText((user.links ?? []).join(", "));
  }, [user]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ tone: "error", message: "" });

    if (!form.skills.length) {
      setFeedback({
        tone: "error",
        message: "Add at least one skill so other students can discover you."
      });
      return;
    }

    if (!form.name.trim() || !form.username.trim() || !form.collegeName.trim()) {
      setFeedback({
        tone: "error",
        message: "Name, username, and college name are required."
      });
      return;
    }

    if (form.bio.trim().length < 20) {
      setFeedback({
        tone: "error",
        message: "Write a short bio with at least 20 characters."
      });
      return;
    }

    const payload = {
      ...form,
      links: parseListText(linksText)
    };

    setSaving(true);

    try {
      const response = await api.put("/profiles/me", payload);
      setUser(response.user);
      setFeedback({
        tone: "success",
        message: isEditMode ? "Profile updated successfully." : "Profile saved successfully."
      });
      navigate("/dashboard");
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page">
      <div className="panel form-shell">
        <div className="page-header">
          <div>
            <p className="eyebrow">{isEditMode ? "Profile settings" : "Onboarding"}</p>
            <h1>{pageTitle}</h1>
            <p className="helper-text page-subtitle">{pageDescription}</p>
          </div>
        </div>
        <InlineNotice tone={feedback.tone} message={feedback.message} />
        <form className="stack profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-header">
              <h2>Personal info</h2>
              <p className="helper-text">The essentials classmates see when deciding to collaborate.</p>
            </div>
            <div className="form-grid two-up">
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => handleChange("username", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>College name</span>
                <input
                  type="text"
                  value={form.collegeName}
                  onChange={(event) => handleChange("collegeName", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>GitHub username</span>
                <input
                  type="text"
                  value={form.githubUsername}
                  onChange={(event) => handleChange("githubUsername", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Department</span>
                <input
                  type="text"
                  value={form.department}
                  onChange={(event) => handleChange("department", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Year</span>
                <input
                  type="text"
                  value={form.year}
                  onChange={(event) => handleChange("year", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Semester</span>
                <input
                  type="text"
                  value={form.semester}
                  onChange={(event) => handleChange("semester", event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Preferred collaboration mode</span>
                <select
                  value={form.preferredCollaborationMode}
                  onChange={(event) =>
                    handleChange("preferredCollaborationMode", event.target.value)
                  }
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Bio</span>
              <textarea
                rows="4"
                value={form.bio}
                onChange={(event) => handleChange("bio", event.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h2>Skills</h2>
              <p className="helper-text">Highlight the skills and project categories you want to be found for.</p>
            </div>
            <SkillInput
              label="Skills"
              value={form.skills}
              onChange={(value) => handleChange("skills", value)}
              placeholder="React, Node.js, UI design"
            />
            <SkillInput
              label="Preferred project types"
              value={form.preferredProjectTypes}
              onChange={(value) => handleChange("preferredProjectTypes", value)}
              placeholder="Hackathon, research, web app"
            />
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h2>Preferences and links</h2>
              <p className="helper-text">Give teammates quick context on your availability and work samples.</p>
            </div>
            <label className="field">
              <span>Links</span>
              <input
                type="text"
                value={linksText}
                onChange={(event) => setLinksText(event.target.value)}
                placeholder="Portfolio URL, LinkedIn URL, resume URL"
              />
            </label>
            <label className="field">
              <span>Availability</span>
              <input
                type="text"
                value={form.availability}
                onChange={(event) => handleChange("availability", event.target.value)}
                placeholder="Evenings, weekends, urgent this week"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button prominent-button" disabled={saving}>
              {saving ? "Saving..." : isEditMode ? "Update profile" : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
