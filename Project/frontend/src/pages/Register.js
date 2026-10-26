import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import "./Auth.css";
import API_BASE_URL from "../config";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password) {
      setError("All fields are required to create an account.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account successfully provisioned! Redirecting to sign in…");
        setTimeout(() => navigate("/login"), 1600);
      } else {
        setError(data.error || "Registration failed. Please verify your details.");
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
            Join the Modern<br />
            <span className="auth-yellow">Fraud Defense</span> Mesh
          </h1>

          <p className="auth-brand-subtext">
            Provision your security analyst access to scan real-world Instagram profiles, view game-theoretic SHAP force plots, and generate audit-ready forensic PDF reports.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Sub-second deep profile feature extraction
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Live Instagram scraping without credential sharing
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              Full historic scan audit trail &amp; analytics
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              AI Safety Assistant powered by Groq LLaMA
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-card-badge">
              <ShieldCheck size={14} /> NEW ENROLLMENT
            </div>
            <h2 className="auth-form-title">Create Analyst Account</h2>
            <p className="auth-form-subtitle">
              Set up your credentials to begin auditing social media identities.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success-banner" role="status">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form" noValidate>
            <div className="auth-field-group">
              <label htmlFor="reg-username">Analyst Handle / Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-field-icon" />
                <input
                  id="reg-username"
                  type="text"
                  placeholder="e.g. alex_miller"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-email">Work Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password">Security Passphrase</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
                  Provisioning Profile...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-switch-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
