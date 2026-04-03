import logo from "../assets/campus-connect-icon-v2.png";
import { GoogleLoginButton } from "../components/GoogleLoginButton";

const heroHighlights = [
  { value: "Verified", label: "Campus-only access" },
  { value: "Skill-first", label: "Teammate discovery" },
  { value: "Structured", label: "Project collaboration" }
];

const features = [
  {
    icon: "SM",
    title: "Skill-Based Matching",
    description: "Find teammates by strengths, stack, and project fit instead of relying on random friend circles."
  },
  {
    icon: "GH",
    title: "GitHub & Portfolio Profiles",
    description: "Evaluate work proof, project quality, and creative range before you invite anyone."
  },
  {
    icon: "RS",
    title: "Reliability Scores",
    description: "Use a visible trust layer built from reviews, ratings, completed work, and responsiveness."
  },
  {
    icon: "CR",
    title: "Smart Collaboration Requests",
    description: "Send focused project invites with role, urgency, timeline, and context in one clean flow."
  },
  {
    icon: "TC",
    title: "Team Conversations",
    description: "Keep accepted collaborations in one organized space with updates, pinned messages, and shared links."
  },
  {
    icon: "PR",
    title: "Project Rooms",
    description: "Track milestones, role ownership, momentum, and deadlines without scattered chats."
  },
  {
    icon: "FB",
    title: "Ratings & Feedback",
    description: "Build a healthier collaboration culture with meaningful project reviews after delivery."
  },
  {
    icon: "VP",
    title: "Verified Student Profiles",
    description: "Stay inside a college-only network so discovery feels trustworthy and relevant."
  }
];

const discoveryStudents = [
  {
    initials: "RK",
    name: "Riya Kapoor",
    role: "Frontend Developer",
    stack: "React • UI/UX • Figma",
    reliability: "4.9 reliability",
    availability: "Available now"
  },
  {
    initials: "NV",
    name: "Naman Verma",
    role: "AI / Backend",
    stack: "Python • AI • Backend",
    reliability: "4.8 reliability",
    availability: "Looking for team"
  },
  {
    initials: "SJ",
    name: "Sara Joseph",
    role: "Product Strategist",
    stack: "Product • Research • Strategy",
    reliability: "4.7 reliability",
    availability: "Busy this week"
  }
];

const testimonials = [
  {
    name: "Aarav, Full-Stack Developer",
    quote:
      "Campus Connect helped me find a designer and backend teammate in one evening. We shipped our hackathon MVP in 36 hours.",
    rating: "5.0"
  },
  {
    name: "Diya, Product Designer",
    quote:
      "The reliability signals made it easy to say yes to the right people. It feels way more serious than random group chats.",
    rating: "4.9"
  },
  {
    name: "Rohan, AI Research Student",
    quote:
      "I finally found teammates who cared about execution, not just ideas. The project room flow is the best part.",
    rating: "5.0"
  }
];

const faqs = [
  {
    question: "Who is Campus Connect for?",
    answer:
      "It is built for college students who want better teammates for hackathons, assignments, startups, clubs, and serious side projects."
  },
  {
    question: "How do students know who is reliable?",
    answer:
      "Profiles include skills, project history, ratings, and reliability signals so students can make better team decisions quickly."
  },
  {
    question: "Can I use it for urgent projects?",
    answer:
      "Yes. Students can search by availability, urgency, role, and work mode to find teammates who are ready now."
  },
  {
    question: "Is it only for developers?",
    answer:
      "No. Designers, founders, PMs, AI builders, frontend developers, backend developers, and multidisciplinary creators can all collaborate."
  }
];

const dashboardStats = [
  { label: "Pending Requests", value: "18" },
  { label: "Active Projects", value: "06" },
  { label: "Unread Messages", value: "12" },
  { label: "Reliability Score", value: "4.9" }
];

export const LandingPage = () => {
  return (
    <div className="marketing-page">
      <div className="marketing-orb marketing-orb-left" />
      <div className="marketing-orb marketing-orb-right" />
      <div className="marketing-grid-glow" />

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <div className="marketing-badge">
            <img className="marketing-badge-logo" src={logo} alt="Campus Connect logo" />
            <span>Campus Connect for ambitious students</span>
          </div>
          <h1>Find the Perfect Teammates for Your Next Project</h1>
          <p className="marketing-subtitle">
            Discover skilled students, build stronger teams, and collaborate with people who actually deliver.
          </p>

          <div className="marketing-cta-row">
            <a className="primary-button marketing-cta-button" href="#discover">
              Find Teammates
            </a>
            <a className="ghost-button marketing-secondary-button" href="#how-it-works">
              See How It Works
            </a>
          </div>

          <div className="marketing-hero-metrics">
            {heroHighlights.map((item) => (
              <div key={item.label} className="marketing-metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="marketing-login-shell" id="login">
            <div className="marketing-login-copy">
              <strong>Join your campus network</strong>
              <span>Sign in with your college-linked Google account to start building.</span>
            </div>
            <GoogleLoginButton />
          </div>

          <div className="marketing-floating-tags">
            {["React", "AI", "Figma", "Backend", "GitHub", "Reliable"].map((tag) => (
              <span key={tag} className="marketing-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="marketing-hero-visual">
          <div className="marketing-dashboard-card">
            <div className="marketing-window-bar">
              <span />
              <span />
              <span />
            </div>

            <div className="marketing-visual-header">
              <div>
                <small>Discover workspace</small>
                <strong>Realtime teammate search</strong>
              </div>
              <span className="marketing-filter-chip">Reliable 4.5+</span>
            </div>

            <div className="marketing-search-row">
              <div className="marketing-search-pill">Search React, AI, UI/UX, Backend...</div>
              <div className="marketing-search-pill compact">Hybrid mode</div>
            </div>

            <div className="marketing-visual-body">
              <div className="marketing-profile-stack">
                <div className="marketing-profile-card">
                  <div className="marketing-avatar">AM</div>
                  <div>
                    <strong>Aarav Mehta</strong>
                    <p>@aarav-builds • Frontend + Node</p>
                    <div className="marketing-mini-tags">
                      <span>React</span>
                      <span>Node.js</span>
                      <span>Hackathon Ready</span>
                    </div>
                  </div>
                  <div className="marketing-score-block">
                    <span>4.9</span>
                    <small>Reliable</small>
                  </div>
                </div>

                <div className="marketing-profile-card">
                  <div className="marketing-avatar purple">DS</div>
                  <div>
                    <strong>Diya Sharma</strong>
                    <p>@diya-designs • Product Designer</p>
                    <div className="marketing-mini-tags">
                      <span>Figma</span>
                      <span>UI/UX</span>
                      <span>Looking for Team</span>
                    </div>
                  </div>
                  <button className="marketing-invite-button">Invite to Team</button>
                </div>
              </div>

              <div className="marketing-visual-sidebar">
                <div className="marketing-visual-card">
                  <small>Shortlist</small>
                  <strong>8 strong matches</strong>
                  <p>2 students with UI/UX skills and 3 with strong backend reputation.</p>
                </div>
                <div className="marketing-visual-card">
                  <small>Signals</small>
                  <div className="marketing-mini-tags">
                    <span>Fast responder</span>
                    <span>5 completed projects</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="marketing-side-float float-availability">Available Now</div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="features">
        <div className="marketing-section-heading">
          <span className="eyebrow">Core Value</span>
          <h2>Everything students need to build better teams, faster</h2>
          <p>
            Campus Connect combines discovery, trust signals, structured requests, and project coordination in one
            polished campus workflow.
          </p>
        </div>
        <div className="marketing-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="marketing-feature-card">
              <div className="marketing-feature-icon">{feature.icon}</div>
              <span className="marketing-card-kicker">Premium workflow</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="how-it-works">
        <div className="marketing-section-heading">
          <span className="eyebrow">How It Works</span>
          <h2>Go from profile to shipped project in four simple steps</h2>
        </div>
        <div className="marketing-timeline">
          {[
            {
              title: "Create Your Profile",
              body: "Show your strengths, links, availability, badges, and preferred work mode."
            },
            {
              title: "Discover Skilled Students",
              body: "Search with filters for skills, reliability, GitHub presence, and urgency."
            },
            {
              title: "Send Collaboration Requests",
              body: "Send requests with role, deadline, project type, and the context teammates need."
            },
            {
              title: "Build Great Projects Together",
              body: "Coordinate in one project room with messages, milestones, resources, and reviews."
            }
          ].map((step, index) => (
            <div key={step.title} className="marketing-timeline-step">
              <div className="marketing-step-index">0{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="discover">
        <div className="marketing-section-heading">
          <span className="eyebrow">Student Discovery Preview</span>
          <h2>A search experience built for finding real collaborators</h2>
        </div>
        <div className="marketing-preview-panel">
          <aside className="marketing-filter-panel">
            <strong>Advanced Filters</strong>
            <span>Role: Frontend Developer</span>
            <span>Skills: React, TypeScript</span>
            <span>Mode: Hybrid</span>
            <span>Reliability: 4.5+</span>
            <span>Availability: This Week</span>
            <div className="marketing-filter-stack">
              <span className="marketing-tag">Hackathon</span>
              <span className="marketing-tag">Urgent</span>
            </div>
          </aside>

          <div className="marketing-discovery-main">
            <div className="marketing-discovery-toolbar">
              <div className="marketing-search-pill wide">Search by role, skills, GitHub, or project type</div>
              <div className="marketing-toolbar-actions">
                <span className="marketing-filter-chip">Sort: Most Reliable</span>
                <span className="marketing-filter-chip">12 Results</span>
              </div>
            </div>

            <div className="marketing-student-grid">
              {discoveryStudents.map((student) => (
                <article key={student.name} className="marketing-student-card">
                  <div className="marketing-student-top">
                    <div className="marketing-avatar gradient">{student.initials}</div>
                    <div>
                      <strong>{student.name}</strong>
                      <p>{student.role}</p>
                    </div>
                  </div>
                  <p>{student.stack}</p>
                  <div className="marketing-mini-tags">
                    <span>GitHub Active</span>
                    <span>{student.reliability}</span>
                  </div>
                  <div className="marketing-card-footer">
                    <span className="marketing-availability">{student.availability}</span>
                    <button className="marketing-invite-button">Invite to Team</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="projects">
        <div className="marketing-section-heading">
          <span className="eyebrow">Dashboard Preview</span>
          <h2>A command center for requests, projects, and reputation</h2>
        </div>
        <div className="marketing-dashboard-preview">
          <aside className="marketing-sidebar">
            <span>Overview</span>
            <span>Discover</span>
            <span>Messages</span>
            <span>Projects</span>
            <span>Notifications</span>
          </aside>
          <div className="marketing-dashboard-main">
            <div className="marketing-dashboard-stats">
              {dashboardStats.map((item) => (
                <div key={item.label} className="marketing-dashboard-stat">
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="marketing-dashboard-columns">
              <div className="marketing-dashboard-card-block">
                <h3>Recommended Teammates</h3>
                <p>Based on React, AI, and rapid delivery projects.</p>
                <div className="marketing-list-mini">
                  <span>Diya Sharma • UI/UX • 4.9</span>
                  <span>Rohan Iyer • AI • 4.7</span>
                  <span>Ayesha Khan • Backend • 4.8</span>
                </div>
              </div>

              <div className="marketing-dashboard-card-block">
                <h3>Reliability Progress</h3>
                <div className="marketing-progress-line">
                  <div className="marketing-progress-bar" />
                </div>
                <p>Trusted collaborator badge unlocking after one more completed project.</p>
              </div>
            </div>

            <div className="marketing-dashboard-columns">
              <div className="marketing-dashboard-card-block">
                <h3>Upcoming Deadlines</h3>
                <div className="marketing-list-mini">
                  <span>Hackathon landing page review • Tomorrow</span>
                  <span>AI project API milestone • Friday</span>
                  <span>Design sync with frontend team • 6 PM</span>
                </div>
              </div>

              <div className="marketing-dashboard-card-block">
                <h3>Current Team Momentum</h3>
                <div className="marketing-mini-tags">
                  <span>3 active collaborators</span>
                  <span>2 pinned updates</span>
                  <span>76% progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span className="eyebrow">Project Collaboration</span>
          <h2>Project rooms that keep ambitious teams moving</h2>
        </div>
        <div className="marketing-collab-grid">
          <div className="marketing-collab-card">
            <h3>Project Room</h3>
            <div className="marketing-mini-tags">
              <span>3 Members</span>
              <span>Frontend</span>
              <span>Backend</span>
              <span>UI/UX</span>
            </div>
            <div className="marketing-list-mini">
              <span>Milestone 1: Landing page complete</span>
              <span>Milestone 2: API integration in progress</span>
              <span>Deadline reminder: 3 days left</span>
            </div>
          </div>

          <div className="marketing-collab-card">
            <h3>Shared Progress</h3>
            <div className="marketing-progress-line">
              <div className="marketing-progress-bar wide" />
            </div>
            <p>76% project completion with pinned messages, shared docs, and active role assignments.</p>
          </div>

          <div className="marketing-collab-card">
            <h3>Role Assignments</h3>
            <div className="marketing-list-mini">
              <span>Aarav • Frontend owner</span>
              <span>Diya • Product design</span>
              <span>Rohan • AI + backend integration</span>
            </div>
          </div>

          <div className="marketing-collab-card">
            <h3>Team Chat</h3>
            <div className="marketing-chat-preview">
              <span>Aarav: Shared the GitHub repo and route map.</span>
              <span>Diya: Updated the Figma and pushed the new card layout.</span>
              <span>Rohan: Need the API spec before midnight.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="testimonials">
        <div className="marketing-section-heading">
          <span className="eyebrow">Testimonials</span>
          <h2>Students already building stronger teams with Campus Connect</h2>
        </div>
        <div className="marketing-testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="marketing-testimonial-card">
              <div className="marketing-testimonial-top">
                <div className="marketing-avatar gradient">{testimonial.name.charAt(0)}</div>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.rating} rating</span>
                </div>
              </div>
              <p>{testimonial.quote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="faq">
        <div className="marketing-section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Questions ambitious students usually ask</h2>
        </div>
        <div className="marketing-faq-list">
          {faqs.map((item) => (
            <details key={item.question} className="marketing-faq-card">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="marketing-final-cta">
        <div className="marketing-final-cta-content">
          <span className="eyebrow">Ready to level up your campus network?</span>
          <h2>Join Campus Connect and build with students who actually ship.</h2>
          <p>
            Find reliable teammates, move faster on projects, and turn campus ideas into real outcomes.
          </p>
          <div className="marketing-cta-row">
            <a className="primary-button marketing-cta-button" href="#login">
              Join Campus Connect
            </a>
            <span className="marketing-cta-note">Trusted by ambitious college communities building fast.</span>
          </div>
        </div>
      </section>

      <footer className="marketing-footer">
        <div className="marketing-footer-brand">
          <img className="brand-logo" src={logo} alt="Campus Connect logo" />
          <div>
            <strong>Campus Connect</strong>
            <p>Where ambitious college students find the right people to build with.</p>
          </div>
        </div>
        <div className="marketing-footer-links">
          <a href="#features">Features</a>
          <a href="#discover">Discover</a>
          <a href="#projects">Projects</a>
          <a href="#faq">FAQ</a>
          <a href="#login">Login</a>
        </div>
        <div className="marketing-footer-meta">
          <span>Instagram</span>
          <span>LinkedIn</span>
          <span>GitHub</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
};
