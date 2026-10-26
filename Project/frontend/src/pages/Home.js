import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Activity,
  Search,
  BarChart3,
  Database,
  ArrowRight,
  FileText,
  Cpu
} from "lucide-react";
import heroImage from "../assets/hero_image.png";
import "./Home.css";
import API_BASE_URL from "../config";

/* Typewriter hook */
function useTypewriter(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    let timeout;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, speed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

const ROTATING_WORDS = [
  "Fake Profiles",
  "Bot Accounts",
  "Suspicious Activity",
  "Fraudulent Identities",
];

/* ── Pre-login Landing Page ── */
const LandingPage = () => {
  const typed = useTypewriter(ROTATING_WORDS);

  return (
    <div className="landing-page">
      {/* Background glow lines */}
      <div className="landing-electric-grid" />

      {/* ─── HERO ─── */}
      <section className="hero-section">
        {/* Left: Text content */}
        <div className="hero-content-col">
          <div className="hero-badge">
            <Zap size={14} className="hero-badge-icon" />
            <span>ENTERPRISE CYBERSECURITY // DEEP MLP</span>
          </div>

          <h1 className="hero-headline">
            Instantly Detect<br />
            <span className="hero-typed">
              {typed}
              <span className="cursor">_</span>
            </span>
            <br />
            on Instagram
          </h1>

          <p className="hero-subtext">
            Our neural classification architecture analyzes 11 behavioral and metadata dimensions to classify social media accounts with sub-second latency and game-theoretic explainability.
          </p>

          {/* Stat strip */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">11</span>
              <span className="stat-desc">Features Audited</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">93.5%</span>
              <span className="stat-desc">Model Accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">&lt;2s</span>
              <span className="stat-desc">Execution Latency</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">PDF</span>
              <span className="stat-desc">Forensic Reports</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/login" className="btn-primary-hero">
              <span>Launch Scanner</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn-secondary-hero">
              Create Analyst Account
            </Link>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="hero-image-col">
          <div className="hero-img-frame">
            <img
              src={heroImage}
              alt="BLACKOUT AI fraud detection dashboard visualization"
              className="hero-img"
            />
            <div className="frame-corner corner-tl"></div>
            <div className="frame-corner corner-tr"></div>
            <div className="frame-corner corner-bl"></div>
            <div className="frame-corner corner-br"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ── Post-login Dashboard ── */
const PostLoginDashboard = ({ userName }) => {
  const displayName = userName || "Analyst";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [scanTotal, setScanTotal] = useState("…");

  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics`)
      .then((r) => r.json())
      .then((data) => setScanTotal(data.total ?? 0))
      .catch(() => setScanTotal(0));
  }, []);

  const stats = [
    { icon: <Search size={18} className="db-icon-yellow" />, value: scanTotal, label: "Audits Completed" },
    { icon: <Cpu size={18} className="db-icon-yellow" />, value: "93.5%", label: "Neural Model Precision" },
    { icon: <Zap size={18} className="db-icon-yellow" />, value: "<2s", label: "Average Inference Latency" },
    { icon: <FileText size={18} className="db-icon-yellow" />, value: "PDF", label: "Forensic Audit Engine" },
  ];

  const actions = [
    {
      id: "scan",
      icon: <Search size={22} />,
      title: "Run Deep Account Scan",
      desc: "Paste an Instagram URL or handle for instant behavioral extraction and SHAP feature analysis.",
      link: "/prediction",
      cta: "Launch Scanner",
    },
    {
      id: "analytics",
      icon: <BarChart3 size={22} />,
      title: "Threat Intelligence Analytics",
      desc: "Inspect live risk distributions, behavioral follow-ratios, and historic corpus trends.",
      link: "/analytics",
      cta: "View Telemetry",
    },
    {
      id: "dataset",
      icon: <Database size={22} />,
      title: "Feature Repository Taxonomy",
      desc: "Explore the 5,000-sample benchmark dataset and mathematical feature engineering specifications.",
      link: "/dataset",
      cta: "Inspect Dataset",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <div className="greeting-badge">
            <Activity size={13} />
            <span>OPERATIONAL WORKSPACE // ACTIVE SESSION</span>
          </div>
          <h1 className="greeting-headline">
            {greeting}, <span className="greeting-name">{displayName}</span>
          </h1>
          <p className="greeting-sub">Select an intelligence module to begin fraud analysis.</p>
        </div>

        {/* Quick Stats Row */}
        <div className="dashboard-stats">
          {stats.map((s, idx) => (
            <div className="db-stat-item" key={idx}>
              <div className="db-stat-icon-box">{s.icon}</div>
              <div className="db-stat-info">
                <span className="db-stat-value">{s.value}</span>
                <span className="db-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Prominent CTA Banner */}
        <div className="dash-cta-banner">
          <div className="dash-cta-text">
            <div className="dash-cta-tag">{"// REAL-TIME SCANNING"}</div>
            <h2 className="dash-cta-title">Audit an Instagram Profile Now</h2>
            <p className="dash-cta-sub">
              Extract real follower ratios, detect bot-creation patterns, and inspect game-theoretic SHAP attributions in under 2 seconds.
            </p>
          </div>
          <Link to="/prediction" className="dash-cta-btn btn-electric">
            <Zap size={16} />
            <span>Initialize Scanner</span>
          </Link>
        </div>

        {/* Action Cards */}
        <div className="dashboard-cards">
          {actions.map((a) => (
            <Link
              key={a.id}
              to={a.link}
              className={`dash-card dash-card--${a.id}`}
            >
              <div className="dash-card-icon">{a.icon}</div>
              <h3 className="dash-card-title">{a.title}</h3>
              <p className="dash-card-desc">{a.desc}</p>
              <span className="dash-card-cta">
                <span>{a.cta}</span>
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Root export ── */
const Home = ({ isLoggedIn, userName }) =>
  isLoggedIn ? <PostLoginDashboard userName={userName} /> : <LandingPage />;

export default Home;
