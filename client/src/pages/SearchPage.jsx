import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { Avatar } from "../components/Avatar";
import { InlineNotice } from "../components/InlineNotice";
import { useAuth } from "../context/AuthContext";

const defaultFilters = {
  skill: "",
  projectType: "",
  collegeName: "",
  department: "",
  year: "",
  semester: "",
  preferredCollaborationMode: "",
  minimumReliability: "0",
  availability: "",
  githubReady: "false",
  urgency: "medium",
  sortBy: "relevance"
};

export const SearchPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [filters, setFilters] = useState(defaultFilters);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.profileError ?? "");

  const runSearch = async (activeFilters = filters) => {
    setLoading(true);
    setErrorMessage("");
    const query = new URLSearchParams(
      Object.entries(activeFilters).filter(([, value]) => value && value !== "false" && value !== "0")
    ).toString();

    try {
      const response = await api.get(`/profiles/search?${query}`);
      setStudents(response.users);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.completedProfile) {
      runSearch(defaultFilters);
    }
  }, [user]);

  if (!user?.completedProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "false" && value !== "0" && value !== "relevance"
  ).length;

  return (
    <section className="page stack">
      <div className="panel page-header-card app-hero-card discover-header-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Discover</p>
            <h1>Find project teammates</h1>
            <p className="helper-text page-subtitle">
              Filter by skill, department, work mode, reliability, and availability to find the right collaborator.
            </p>
          </div>
          <div className="page-summary-row">
            <span className="status-badge status-active">{students.length} matches</span>
            <span className="pill">{activeFilterCount} filters active</span>
          </div>
        </div>
        <InlineNotice tone="error" message={errorMessage} />
        <div className="filters advanced-filters">
          <input
            type="text"
            placeholder="Skill"
            value={filters.skill}
            onChange={(event) => handleFilterChange("skill", event.target.value)}
          />
          <input
            type="text"
            placeholder="Project type"
            value={filters.projectType}
            onChange={(event) => handleFilterChange("projectType", event.target.value)}
          />
          <input
            type="text"
            placeholder="College"
            value={filters.collegeName}
            onChange={(event) => handleFilterChange("collegeName", event.target.value)}
          />
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(event) => handleFilterChange("department", event.target.value)}
          />
          <input
            type="text"
            placeholder="Year"
            value={filters.year}
            onChange={(event) => handleFilterChange("year", event.target.value)}
          />
          <input
            type="text"
            placeholder="Semester"
            value={filters.semester}
            onChange={(event) => handleFilterChange("semester", event.target.value)}
          />
          <select
            value={filters.preferredCollaborationMode}
            onChange={(event) => handleFilterChange("preferredCollaborationMode", event.target.value)}
          >
            <option value="">Any work mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select
            value={filters.minimumReliability}
            onChange={(event) => handleFilterChange("minimumReliability", event.target.value)}
          >
            <option value="0">Any reliability</option>
            <option value="3">3.0+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
          <input
            type="text"
            placeholder="Availability"
            value={filters.availability}
            onChange={(event) => handleFilterChange("availability", event.target.value)}
          />
          <select
            value={filters.githubReady}
            onChange={(event) => handleFilterChange("githubReady", event.target.value)}
          >
            <option value="false">GitHub optional</option>
            <option value="true">Has GitHub username</option>
          </select>
          <select value={filters.urgency} onChange={(event) => handleFilterChange("urgency", event.target.value)}>
            <option value="low">Low urgency</option>
            <option value="medium">Medium urgency</option>
            <option value="high">High urgency</option>
          </select>
          <select value={filters.sortBy} onChange={(event) => handleFilterChange("sortBy", event.target.value)}>
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Rating</option>
            <option value="newest">Sort: Newest</option>
            <option value="reliable">Sort: Most reliable</option>
          </select>
          <button
            type="button"
            className="primary-button"
            disabled={loading}
            onClick={() => runSearch()}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={loading}
            onClick={() => {
              setFilters(defaultFilters);
              runSearch(defaultFilters);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? <div className="panel empty-state">Loading student profiles...</div> : null}

      <div className="grid discover-grid">
        {students.map((student, index) => (
          <article
            className="panel profile-card discover-card list-item-animate"
            key={student._id}
            style={{ "--stagger-index": index }}
          >
            <div className="profile-top">
              <Avatar name={student.name} src={student.avatar} />
              <div className="profile-heading">
                <h2>{student.name}</h2>
                <p className="helper-text">
                  @{student.username} • {student.department}
                </p>
                <p className="helper-text">
                  {student.year} / {student.semester} • {student.preferredCollaborationMode}
                </p>
              </div>
            </div>
            <p className="body-copy">{student.bio}</p>
            <div className="pill-row">
              {(student.skills ?? []).map((skill) => (
                <span className="pill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <div className="card-meta-list">
              <p className="helper-text">
                Reputation {(Number.isFinite(student.reputationScore) ? student.reputationScore : 0).toFixed(1)} (
                {student.reviewCount ?? 0} reviews)
              </p>
              <p className="helper-text">
                {student.preferredProjectTypes?.length
                  ? `Prefers ${student.preferredProjectTypes.join(", ")}`
                  : "Open to different project types"}
              </p>
              <p className="helper-text">Completed projects: {student.completedProjectsCount ?? 0}</p>
            </div>
            <Link className="primary-button button-block" to={`/students/${student._id}`}>
              View profile
            </Link>
          </article>
        ))}
      </div>
      {!loading && students.length === 0 ? (
        <div className="panel empty-state">
          <h2>No matching students yet</h2>
          <p className="helper-text">
            Try a broader skill, switch work mode, or lower the reliability filter.
          </p>
        </div>
      ) : null}
    </section>
  );
};
