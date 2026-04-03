import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { InlineNotice } from "../components/InlineNotice";

const formatStatus = (status) =>
  status
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get("/projects");
        setProjects(response.projects);
      } catch (error) {
        setFeedback({ tone: "error", message: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <section className="page stack">
      <div className="panel page-header-card app-hero-card">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Manage your active collaborations</h1>
          <p className="helper-text page-subtitle">
            Review project progress, open rooms, and keep milestones and resources organized.
          </p>
        </div>
        <div className="page-summary-row">
          <span className="status-badge status-active">
            {projects.filter((project) => project.status === "active").length} active
          </span>
          <span className="pill">{projects.length} total projects</span>
        </div>
      </div>
      <InlineNotice tone={feedback.tone} message={feedback.message} />
      {loading ? <div className="panel empty-state">Loading projects...</div> : null}
      <div className="grid two-up">
        {projects.map((project, index) => (
          <article
            key={project._id}
            className="panel request-card-shell list-item-animate"
            style={{ "--stagger-index": index }}
          >
            <div className="request-card-header">
              <div>
                <h2>{project.title || project.requestId?.projectTitle}</h2>
                <p className="helper-text">
                  {project.requestId?.senderId?.name} and {project.requestId?.receiverId?.name}
                </p>
              </div>
              <span className={`status-badge status-${project.status}`}>{formatStatus(project.status)}</span>
            </div>
            <p className="body-copy">{project.description || project.requestId?.description}</p>
            <p className="helper-text">
              Timeline: {project.timeline || project.requestId?.expectedDuration || "Flexible"}
            </p>
            <div className="button-row">
              <Link className="primary-button inline-flex" to={`/projects/${project._id}`}>
                Project detail
              </Link>
              <Link className="ghost-button inline-flex" to={`/sessions/${project._id}`}>
                Open room
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!loading && projects.length === 0 ? (
        <div className="panel empty-state">
          <p className="helper-text">Accepted requests will turn into projects here.</p>
        </div>
      ) : null}
    </section>
  );
};
