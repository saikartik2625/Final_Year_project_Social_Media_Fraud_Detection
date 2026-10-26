import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  User,
  Users,
  UserPlus,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Lock,
  AtSign,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  FileDown,
  Activity
} from "lucide-react";
import "./Prediction.css";
import API_BASE_URL from "../config";
import RiskGauge from "../components/RiskGauge";
import ShapForcePlot from "../components/ShapForcePlot";

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const INITIAL_INPUT = {
  username: "",
  fullname: "",
  descriptionLevel: "none",
  profilePic: "yes",
  externalURL: "no",
  privateAcc: "no",
  posts: "",
  followers: "",
  follows: ""
};

const SCAN_PHASES = [
  "Initializing deep neural inference…",
  "Analyzing handle digit entropy & lexical heuristics…",
  "Evaluating follow-to-follower graph divergence…",
  "Extracting SHAP marginal feature attributions…",
  "Executing Deep MLP binary classification…",
  "Synthesizing threat intelligence advisory…"
];

const Prediction = ({ userEmail, setLastPrediction }) => {
  const [userInput, setUserInput] = useState(INITIAL_INPUT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const [error, setError] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [fetchingInsta, setFetchingInsta] = useState(false);
  const [instaNotice, setInstaNotice] = useState(null);

  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [result]);

  const handleChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleFetchInstagram = async (targetUrl = instaUrl) => {
    const urlToFetch = targetUrl || instaUrl;
    if (!urlToFetch || !urlToFetch.trim()) {
      setError("Please enter an Instagram profile handle or URL (e.g. cristiano or https://instagram.com/openai)");
      return;
    }
    setError("");
    setFetchingInsta(true);
    setInstaNotice(null);

    try {
      const response = await fetch(`${API_BASE_URL}/fetch_instagram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToFetch.trim() })
      });
      const data = await response.json();
      if (data.success) {
        setUserInput({
          username: data.username || "",
          fullname: data.fullname || "",
          descriptionLevel: data.descriptionLevel || "short",
          profilePic: data.profilePic || "yes",
          externalURL: data.externalURL || "no",
          privateAcc: data.privateAcc || "no",
          posts: data.posts !== undefined ? String(data.posts) : "",
          followers: data.followers !== undefined ? String(data.followers) : "",
          follows: data.follows !== undefined ? String(data.follows) : ""
        });
        setInstaNotice({
          type: data.isEstimated ? "warning" : "success",
          message: data.isEstimated
            ? `⚠️ Instagram servers rate-limited unauthenticated queries for @${data.username}. Calibrated parameters auto-filled below; you can adjust the exact counts manually.`
            : `✅ Live real-time stats extracted for @${data.username}: ${Number(data.followers || 0).toLocaleString()} followers, ${Number(data.follows || 0).toLocaleString()} following, ${Number(data.posts || 0).toLocaleString()} posts (${data.source || "Instagram Direct"}).`
        });
      } else {
        setError(data.error || "Failed to retrieve Instagram profile data.");
      }
    } catch (err) {
      setError("Could not connect to the Instagram extraction engine. Verify the backend server is running.");
    } finally {
      setFetchingInsta(false);
    }
  };

  const getDescriptionLength = (level) => {
    switch (level) {
      case "short": return 50;
      case "medium": return 150;
      case "long": return 300;
      default: return 0;
    }
  };

  const startScan = async () => {
    if (scanning || loading) return;
    if (!userInput.username || !userInput.fullname || !userInput.posts || !userInput.followers || !userInput.follows) {
      setError("Please complete all required profile fields before initiating scan.");
      return;
    }
    setError("");
    setLoading(true);
    setScanning(true);
    setScanProgress(0);
    setScanPhase(SCAN_PHASES[0]);
    setResult(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanProgress(Math.min(step * 16, 90));
      const phaseIdx = Math.min(Math.floor((step * 16) / (100 / SCAN_PHASES.length)), SCAN_PHASES.length - 1);
      setScanPhase(SCAN_PHASES[phaseIdx]);
      if (step >= 6) clearInterval(interval);
    }, 280);

    try {
      const usernameDigits = (userInput.username.match(/\d/g) || []).length;
      const fullnameDigits = (userInput.fullname.match(/\d/g) || []).length;
      const fullnameWords = userInput.fullname.trim().split(/\s+/).filter(Boolean).length;
      const nameEqualsUsername = userInput.username.toLowerCase() === userInput.fullname.toLowerCase() ? 1 : 0;
      const descLength = getDescriptionLength(userInput.descriptionLevel);

      const payload = {
        "profile pic": userInput.profilePic === "yes" ? 1 : 0,
        "nums/length username": userInput.username.length > 0 ? parseFloat((usernameDigits / userInput.username.length).toFixed(4)) : 0,
        "fullname words": fullnameWords,
        "nums/length fullname": userInput.fullname.length > 0 ? parseFloat((fullnameDigits / userInput.fullname.length).toFixed(4)) : 0,
        "name==username": nameEqualsUsername,
        "description length": descLength,
        "external URL": userInput.externalURL === "yes" ? 1 : 0,
        "private": userInput.privateAcc === "yes" ? 1 : 0,
        "#posts": parseInt(userInput.posts, 10) || 0,
        "#followers": parseInt(userInput.followers, 10) || 0,
        "#follows": parseInt(userInput.follows, 10) || 0,
        "email": userEmail || "anonymous_user",
        "raw_username": userInput.username,
        "raw_fullname": userInput.fullname
      };

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      clearInterval(interval);
      setScanProgress(100);
      setScanPhase("Audit complete.");

      setTimeout(() => {
        setScanning(false);
        setLoading(false);
        if (res.ok) {
          setResult(data);
          if (setLastPrediction) setLastPrediction(data);
        } else {
          setError(data.error || "Analysis failed. Please verify input values.");
        }
      }, 350);
    } catch (err) {
      clearInterval(interval);
      setScanning(false);
      setLoading(false);
      setError("Server connection failure. Ensure Flask backend is running on port 7860.");
    }
  };

  const handleReset = () => {
    setUserInput(INITIAL_INPUT);
    setResult(null);
    setError("");
    setScanProgress(0);
    setInstaUrl("");
    setInstaNotice(null);
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    try {
      const response = await fetch(`${API_BASE_URL}/generate_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: result,
          user_input: userInput
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Forensic_Report_${userInput.username || "Account"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Report generation failed.", err);
    }
  };

  const isGenuine = result && result.risk_level.includes("Genuine");
  const isSuspicious = result && result.risk_level.includes("Suspicious");

  return (
    <div className={`prediction-wrapper ${result ? "has-result" : ""}`}>
      <div className="lab-overlay" />
      <div className="grid-bg" aria-hidden="true" />

      <div className="prediction-container">
        {/* ── Technical Header ── */}
        <header className="analysis-header">
          <div className="header-meta-tag">
            <Activity size={13} className="header-meta-icon" />
            <span>NEURAL FRAUD AUDIT ENGINE // v3.4</span>
          </div>
          <h1>Deep Account Scanner</h1>
          <p className="header-desc">
            Multi-tiered fraud classification combining Feedforward MLP inference, statistical feature normalization, and Game-Theoretic SHAP interpretability.
          </p>
        </header>

        {/* ── Input Card ── */}
        <div className="analysis-card glass-panel interactive">
          {/* ── Instagram Profile URL Auto-Fetch Section ── */}
          <div className="insta-autofill-box">
            <div className="insta-box-header">
              <div className="insta-badge-title">
                <InstagramIcon size={16} className="insta-icon-badge" />
                <span>Live Instagram Ingestion</span>
              </div>
              <span className="insta-tagline">Enter an Instagram handle or profile URL for instant parameter extraction</span>
            </div>

            <div className="insta-search-bar">
              <div className="insta-input-wrapper">
                <span className="insta-prefix">instagram.com/</span>
                <input
                  type="text"
                  className="insta-field"
                  placeholder="e.g. cristiano, openai, or username"
                  value={instaUrl}
                  onChange={(e) => setInstaUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFetchInstagram();
                  }}
                />
              </div>
              <button
                type="button"
                className={`insta-action-btn ${fetchingInsta ? "loading" : ""}`}
                onClick={() => handleFetchInstagram()}
                disabled={fetchingInsta}
              >
                <Zap size={15} />
                <span>{fetchingInsta ? "Extracting..." : "Auto-Fill"}</span>
              </button>
            </div>

            {/* Quick Demo Presets for Presentations */}
            <div className="insta-presets-wrapper">
              <span className="presets-heading">Quick Viva Benchmarks:</span>
              <div className="presets-list">
                <button
                  type="button"
                  className="preset-pill chip-celebrity"
                  onClick={() => {
                    setInstaUrl("cristiano");
                    handleFetchInstagram("cristiano");
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>@cristiano (Verified)</span>
                </button>
                <button
                  type="button"
                  className="preset-pill chip-authentic"
                  onClick={() => {
                    setInstaUrl("alex_miller_tech");
                    handleFetchInstagram("alex_miller_tech");
                  }}
                >
                  <User size={13} />
                  <span>@alex_miller_tech (Authentic)</span>
                </button>
                <button
                  type="button"
                  className="preset-pill chip-suspicious"
                  onClick={() => {
                    setInstaUrl("johndoe_1998");
                    handleFetchInstagram("johndoe_1998");
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>@johndoe_1998 (Suspicious)</span>
                </button>
                <button
                  type="button"
                  className="preset-pill chip-bot"
                  onClick={() => {
                    setInstaUrl("free_crypto_airdrop992");
                    handleFetchInstagram("free_crypto_airdrop992");
                  }}
                >
                  <ShieldAlert size={13} />
                  <span>@free_crypto_airdrop992 (Bot Farm)</span>
                </button>
                <button
                  type="button"
                  className="preset-pill chip-private"
                  onClick={() => {
                    setInstaUrl("emma_private_personal");
                    handleFetchInstagram("emma_private_personal");
                  }}
                >
                  <Lock size={13} />
                  <span>@emma_private (Private)</span>
                </button>
              </div>
            </div>

            {instaNotice && (
              <div className="insta-success-banner">
                <CheckCircle2 size={16} />
                <span>{instaNotice.message}</span>
              </div>
            )}
          </div>

          <div className="input-divider">
            <span>{"// PROFILE TELEMETRY ATTRIBUTES"}</span>
          </div>

          {/* Row 1 — Username + Display Name */}
          <div className="input-row two-col">
            <div className="input-group">
              <label htmlFor="username">
                <AtSign size={14} className="ficon" /> Username Handle
              </label>
              <input
                id="username"
                name="username"
                placeholder="e.g. alex_miller99"
                value={userInput.username}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div className="input-group">
              <label htmlFor="fullname">
                <User size={14} className="ficon" /> Full Display Name
              </label>
              <input
                id="fullname"
                name="fullname"
                placeholder="e.g. Alex Miller"
                value={userInput.fullname}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2 — Posts / Followers / Following */}
          <div className="input-row three-col">
            <div className="input-group">
              <label htmlFor="posts">
                <ImageIcon size={14} className="ficon" /> Media Post Count
              </label>
              <input
                id="posts"
                type="number"
                name="posts"
                placeholder="0"
                min="0"
                value={userInput.posts}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="followers">
                <Users size={14} className="ficon" /> Follower Count
              </label>
              <input
                id="followers"
                type="number"
                name="followers"
                placeholder="0"
                min="0"
                value={userInput.followers}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="follows">
                <UserPlus size={14} className="ficon" /> Following Count
              </label>
              <input
                id="follows"
                type="number"
                name="follows"
                placeholder="0"
                min="0"
                value={userInput.follows}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="input-divider">
            <span>{"// BEHAVIORAL & STRUCTURAL MARKERS"}</span>
          </div>

          {/* Row 3 — Bio + Profile Pic */}
          <div className="input-row two-col">
            <div className="input-group">
              <label htmlFor="descriptionLevel">
                <FileText size={14} className="ficon" /> Biography Complexity
              </label>
              <select
                id="descriptionLevel"
                name="descriptionLevel"
                value={userInput.descriptionLevel}
                onChange={handleChange}
              >
                <option value="none">Empty Bio (0 characters)</option>
                <option value="short">Short — Concise (1–80 chars)</option>
                <option value="medium">Detailed — Organic (80–200 chars)</option>
                <option value="long">Extended — Influencer / Enterprise (200+ chars)</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="profilePic">
                <ImageIcon size={14} className="ficon" /> Avatar Asset State
              </label>
              <select
                id="profilePic"
                name="profilePic"
                value={userInput.profilePic}
                onChange={handleChange}
              >
                <option value="yes">Avatar Present (Verified Image)</option>
                <option value="no">Anonymous / Blank Default Icon</option>
              </select>
            </div>
          </div>

          {/* Row 4 — External Link + Privacy */}
          <div className="input-row two-col">
            <div className="input-group">
              <label htmlFor="externalURL">
                <LinkIcon size={14} className="ficon" /> External Link in Bio
              </label>
              <select
                id="externalURL"
                name="externalURL"
                value={userInput.externalURL}
                onChange={handleChange}
              >
                <option value="no">No External Link</option>
                <option value="yes">Contains External URL / Linktree</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="privateAcc">
                <Lock size={14} className="ficon" /> Account Privacy State
              </label>
              <select
                id="privateAcc"
                name="privateAcc"
                value={userInput.privateAcc}
                onChange={handleChange}
              >
                <option value="no">Public Profile</option>
                <option value="yes">Private Profile</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="prediction-error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Scan Control & Electric Scanning Effect ── */}
        <div className="action-control">
          {!scanning && !result && (
            <button className="scan-trigger btn-electric" onClick={startScan} disabled={scanning}>
              <Zap size={18} />
              <span>Initialize Deep Account Scan</span>
            </button>
          )}

          {scanning && (
            <div className="scanner-ui">
              <div className="scanner-line-container">
                <div className="scanner-line" />
                <div className="scanner-grid-pulse" />
              </div>
              <div className="scanner-status-row">
                <span className="scanner-pulse-tag">ACTIVE SCAN</span>
                <p className="scanner-text">{scanPhase}</p>
                <span className="progress-pct">{scanProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Result Card ── */}
        {result && (
          <div
            ref={resultRef}
            className={`assessment-result ${isGenuine ? "low-risk" : isSuspicious ? "med-risk" : "high-risk"}`}
          >
            <div className="result-header">
              <div className="result-verdict">
                <span className="verdict-icon">
                  {isGenuine ? <CheckCircle2 size={32} /> : isSuspicious ? <AlertTriangle size={32} /> : <ShieldAlert size={32} />}
                </span>
                <div>
                  <p className="verdict-label">Forensic Classification</p>
                  <h2>{result.risk_level}</h2>
                </div>
              </div>
              <div className="risk-score">
                <span className="score-val">{result.probability}%</span>
                <span className="score-label">Fraud Probability</span>
              </div>
            </div>

            {/* Probability Tier Semicircular Gauge */}
            <RiskGauge probability={result.probability} riskLevel={result.risk_level} />

            <p className="expert-message">{result.message}</p>

            {/* Real-time SHAP Feature Attribution Force Plot */}
            <ShapForcePlot
              shapValues={result.shap_values}
              baseValue={result.base_value || 40.2}
              finalProbability={result.probability}
            />

            {result.ai_insight && (
              <div className="ai-insight-box">
                <div className="insight-header">
                  <Sparkles size={16} className="insight-sparkle-icon" />
                  <span className="ai-badge">Security Advisory Insight</span>
                </div>
                <p className="insight-text">{result.ai_insight}</p>
              </div>
            )}

            <div className="result-actions">
              <button className="reset-btn btn-secondary" onClick={handleReset}>
                <RotateCcw size={15} />
                <span>New Audit</span>
              </button>
              <button className="download-cta btn-electric" onClick={handleDownloadReport}>
                <FileDown size={15} />
                <span>Download Forensic PDF Report</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
