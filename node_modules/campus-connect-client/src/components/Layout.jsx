import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/campus-connect-icon-v2.png";
import { useAuth } from "../context/AuthContext";

export const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isMarketingPage = !user && location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div
      className={`shell ${isMarketingPage ? "marketing-shell" : ""} ${user ? "app-shell" : ""}`}
    >
      <header
        className={`topbar ${isMarketingPage ? "marketing-topbar" : ""} ${user ? "app-topbar" : ""} ${
          scrolled ? "topbar-scrolled" : ""
        }`}
      >
        <Link to="/" className="brand">
          <img className="brand-logo" src={logo} alt="Campus Connect logo" />
          <span>Campus Connect</span>
        </Link>

        {user ? (
          <nav className="nav app-nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/discover">Discover</NavLink>
            <NavLink to="/requests">Requests</NavLink>
            <NavLink to="/messages">Messages</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/profile/edit">Edit Profile</NavLink>
            <NavLink to="/settings">Settings</NavLink>
            <button type="button" className="ghost-button app-signout" onClick={handleSignOut}>
              Sign out
            </button>
          </nav>
        ) : isMarketingPage ? (
          <>
            <nav className="nav marketing-nav">
              <a href="#features">Features</a>
              <a href="#discover">Discover</a>
              <a href="#projects">Projects</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div className="marketing-actions">
              <a className="ghost-button inline-flex" href="#login">
                Login
              </a>
              <a className="primary-button inline-flex marketing-cta-button" href="#login">
                Get Started
              </a>
            </div>
          </>
        ) : null}
      </header>
      <main
        className={`content ${isMarketingPage ? "marketing-content" : ""} ${user ? "app-content" : ""}`}
      >
        {children}
      </main>
    </div>
  );
};
