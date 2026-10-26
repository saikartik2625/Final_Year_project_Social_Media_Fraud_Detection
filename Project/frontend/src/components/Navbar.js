import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Shield, Zap, Activity, Database, LogOut, Sun, Moon, Search } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ isLoggedIn, onLogout }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((curr) => (curr === "light" ? "dark" : "light"));
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate("/");
  };

  const linkClass = ({ isActive }) => (isActive ? "nav-link active-link" : "nav-link");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to={isLoggedIn ? "/dashboard" : "/"} className="navbar-logo">
          <div className="logo-icon-wrap">
            <Shield className="logo-shield-icon" size={20} />
            <Zap className="logo-zap-sub" size={10} />
          </div>
          <div className="logo-text-container">
            <span className="logo-title">
              <span className="logo-highlight">Social Media Fraud Detection</span>
              
              
            </span>
            <span className="logo-tagline">AI-Powered Identity Verification</span>
          </div>
        </NavLink>
      </div>

      <div className="navbar-right">
        <div className="navbar-links">
          <NavLink to={isLoggedIn ? "/dashboard" : "/"} className={linkClass} end>
            Home
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "nav-btn-login active-link" : "nav-btn-login"}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? "nav-btn-register active-link" : "nav-btn-register"}>
                <Zap size={15} />
                Get Started
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/prediction" className={linkClass}>
                <Search size={15} className="nav-icon" />
                Prediction
              </NavLink>
              <NavLink to="/dataset" className={linkClass}>
                <Database size={15} className="nav-icon" />
                Dataset
              </NavLink>
              <NavLink to="/analytics" className={linkClass}>
                <Activity size={15} className="nav-icon" />
                Analytics
              </NavLink>
              <button className="logout-btn" onClick={handleLogoutClick}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle theme">
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
