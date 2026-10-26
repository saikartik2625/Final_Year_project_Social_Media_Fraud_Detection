import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import "./Auth.css";
import API_BASE_URL from "../config";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid credentials. Please verify your login details.");
      }
    } catch {
      setError("Could not connect to the authentication server. Verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Brand Panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">
              <Shield size={22} className="auth-shield" />
              <Zap size={11} className="auth-zap" />
            </div>
            <div>
              <div className="auth-brand-name">
                <span className="auth-yellow">Social Media Fraud Detection</span>
              </div>
              <div className="auth-brand-tagline">{"// ENTERPRISE CYBERSECURITY"}</div>
            </div>
          </div>

          <h1 className="auth-brand-heading">
            Detect Fake Profiles<br />
            with <span className="auth-yellow">AI Precision</span>
          </h1>

          <p className="auth-brand-subtext">
            Our machine learning engine analyzes 11 behavioral and metadata signals to flag suspicious Instagram accounts with game-theoretic explainability.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Real-time deep behavioral profiling
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Calibrated fraud probability &amp; risk tiers
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              KernelSHAP transparent explainability plots
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Downloadable forensic PDF intelligence reports
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-card-badge">
              <ShieldCheck size={14} /> SECURE GATEWAY
            </div>
            <h2 className="auth-form-title">Analyst Sign In</h2>
            <p className="auth-form-subtitle">
              Enter your credentials to access the fraud intelligence dashboard.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field-group">
              <label htmlFor="login-email">Account Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>Don't have an analyst account?</span>
            <Link to="/register" className="auth-switch-link">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
