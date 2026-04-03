import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";

const emptyMilestone = { title: "", dueDate: "", isCompleted: false };
const emptyResource = { label: "", url: "" };

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    timeline: "",
    status: "active",
    milestones: [emptyMilestone],
    sharedResources: [emptyResource]
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.project);
      setForm({
        title: response.project.title || response.project.requestId?.projectTitle || "",
        description: response.project.description || response.project.requestId?.description || "",
        timeline: response.project.timeline || response.project.requestId?.expectedDuration || "",
        status: response.project.status,
        milestones: response.project.milestones?.length
          ? response.project.milestones.map((item) => ({
              title: item.title,
              dueDate: item.dueDate ? item.dueDate.slice(0, 10) : "",
              isCompleted: Boolean(item.isCompleted)
            }))
          : [emptyMilestone],
        sharedResources: response.project.sharedResources?.length
          ? response.project.sharedResources
          : [emptyResource]
      });
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleMilestoneChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      milestones: current.milestones.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleResourceChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      sharedResources: current.sharedResources.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const saveProject = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.patch(`/projects/${projectId}`, form);
      setFeedback({ tone: "success", message: "Project details updated." });
      await loadProject();
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (!project) {
    return <div className="panel empty-state">Loading project details...</div>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Project Detail</p>
          <h1>{form.title}</h1>
          <p className="helper-text page-subtitle">
            Update project status, track milestones, and keep shared resources organized.
          </p>
        </div>
      </div>
      <InlineNotice tone={feedback.tone} message={feedback.message} />
      <form className="panel stack" onSubmit={saveProject}>
        <div className="form-grid two-up">
          <label className="field">
            <span>Project title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>Timeline</span>
          <input
            type="text"
            value={form.timeline}
            onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value }))}
          />
        </label>

        <div className="form-section">
          <div className="form-section-header">
            <h2>Milestones</h2>
          </div>
          {form.milestones.map((milestone, index) => (
            <div key={`${milestone.title}-${index}`} className="form-grid two-up">
              <label className="field">
                <span>Milestone</span>
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(event) => handleMilestoneChange(index, "title", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Due date</span>
                <input
                  type="date"
                  value={milestone.dueDate}
                  onChange={(event) => handleMilestoneChange(index, "dueDate", event.target.value)}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h2>Shared resources</h2>
          </div>
          {form.sharedResources.map((resource, index) => (
            <div key={`${resource.label}-${index}`} className="form-grid two-up">
              <label className="field">
                <span>Label</span>
                <input
                  type="text"
                  value={resource.label}
                  onChange={(event) => handleResourceChange(index, "label", event.target.value)}
                />
              </label>
              <label className="field">
                <span>URL</span>
                <input
                  type="url"
                  value={resource.url}
                  onChange={(event) => handleResourceChange(index, "url", event.target.value)}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link className="ghost-button inline-flex" to={`/sessions/${project._id}`}>
            Open room
          </Link>
        </div>
      </form>
    </section>
  );
};
