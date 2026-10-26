import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Zap, Terminal, Database, Cpu, Code2 } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();
  // Don't show footer on the locked landing page (/ pre-login)
  if (location.pathname === "/") return null;

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Left — Branding */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-icon-box">
              <Shield size={16} className="footer-shield" />
              <Zap size={8} className="footer-zap" />
            </div>
            <span className="footer-logo-name">
              <span className="footer-yellow">Social Media</span> FRAUD DETECTION
            </span>
          </div>
          <p className="footer-tagline">
            Next-generation enterprise fraud detection platform. Analyzing behavioral signals, metadata entropy, and game-theoretic explainability in real time.
          </p>
        </div>

        {/* Center — Links */}
        <div className="footer-links">
          <div className="footer-link-group">
            <p className="footer-link-heading">Platform</p>
            <Link to="/prediction">Deep Account Scan</Link>
            <Link to="/analytics">Threat Intelligence</Link>
            <Link to="/dataset">Feature Taxonomy</Link>
          </div>
          <div className="footer-link-group">
            <p className="footer-link-heading">Security</p>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Analyst Account</Link>
            <span className="footer-status-pill">
              <span className="pulse-dot"></span> System Operational
            </span>
          </div>
        </div>

        {/* Right — Tech stack badges */}
        <div className="footer-tech">
          <p className="footer-link-heading">Architecture Stack</p>
          <div className="footer-badges">
            <span className="footer-badge"><Code2 size={12} /> React 19</span>
            <span className="footer-badge"><Terminal size={12} /> Flask Engine</span>
            <span className="footer-badge"><Cpu size={12} /> Deep MLP + SHAP</span>
            <span className="footer-badge"><Database size={12} /> MongoDB Enterprise</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {year} BLACKOUT Security Intelligence &nbsp;·&nbsp; Academic &amp; Research Forensic Engine &nbsp;·&nbsp; All rights reserved.
        </p>
        <p className="footer-disclaimer">
          Probabilistic risk modeling powered by KernelSHAP. Calibrated for Instagram fraud pattern classification.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
