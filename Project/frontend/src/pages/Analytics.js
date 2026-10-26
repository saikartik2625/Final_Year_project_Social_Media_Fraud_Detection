import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Search,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Image,
  FileText,
  Link as LinkIcon
} from "lucide-react";
import "./Analytics.css";
import API_BASE_URL from "../config";

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="analytics-tooltip">
        <p className="analytics-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="analytics-tooltip-item" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [liveData, setLiveData] = useState({
    total: 0,
    risk_counts: {
      "Likely Genuine": 0,
      "Uncertain / Suspicious": 0,
      "Likely Fraudulent": 0
    },
    distribution: [
      { name: "Genuine", value: 0 },
      { name: "Fraudulent", value: 0 }
    ]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics`);
        const data = await response.json();
        setLiveData(data);
      } catch (error) {
        console.error("Failed to fetch analytics telemetry:", error);
      }
    };
    fetchAnalytics();
  }, []);

  // Historical Dataset Statistics
  const accountDistribution = [
    { name: "Genuine", value: 2500 },
    { name: "Fraudulent", value: 2500 }
  ];

  const followerFollowData = [
    { type: "Genuine", followers: 1200, follows: 500 },
    { type: "Fraudulent", followers: 300, follows: 1200 }
  ];

  const activityData = [
    { type: "Genuine", posts: 180 },
    { type: "Fraudulent", posts: 40 }
  ];

  const profilePicData = [
    { name: "With Avatar", Genuine: 95, Fraudulent: 20 },
    { name: "Blank / None", Genuine: 5, Fraudulent: 80 }
  ];

  const descriptionLengthData = [
    { range: "Empty Bio", Genuine: 5, Fraudulent: 60 },
    { range: "Short (<80)", Genuine: 20, Fraudulent: 30 },
    { range: "Detailed (80+)", Genuine: 75, Fraudulent: 10 }
  ];

  const externalUrlData = [
    { name: "Has Link", Genuine: 70, Fraudulent: 20 },
    { name: "No Link", Genuine: 30, Fraudulent: 80 }
  ];

  const PIE_COLORS = ["#22C55E", "#EF4444"];

  return (
    <div className="analytics-container">
      <div className="analytics-page-header">
        <div className="analytics-meta-badge">
          <Activity size={13} />
          <span>FORENSIC TELEMETRY &amp; THREAT INTELLIGENCE</span>
        </div>
        <h2>Enterprise Threat Analytics</h2>
        <p className="subtitle">
          Comprehensive behavioral telemetry distinguishing authentic creator accounts from automated bot networks.
        </p>
      </div>

      {/* ── Section 1: Live Pulse Metrics ── */}
      <div className="analytics-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <TrendingUp size={18} className="section-title-icon" />
            <h3 className="section-title">
              <span>Live Ingestion</span> Telemetry
            </h3>
          </div>
          <span className="live-indicator-pill">
            <span className="live-dot" /> STREAMING AUDITS
          </span>
        </div>

        <div className="stats-summary">
          <div className="stat-card total">
            <div className="stat-card-top">
              <span className="stat-label">Total Accounts Audited</span>
              <Search size={16} className="stat-icon-muted" />
            </div>
            <span className="stat-value">{liveData.total}</span>
            <span className="stat-footer-text">Production database records</span>
          </div>

          <div className="stat-card genuine">
            <div className="stat-card-top">
              <span className="stat-label">Likely Genuine</span>
              <ShieldCheck size={16} className="stat-icon-green" />
            </div>
            <span className="stat-value">{liveData.risk_counts["Likely Genuine"]}</span>
            <span className="stat-footer-text">Low fraud probability (&lt;45%)</span>
          </div>

          <div className="stat-card suspicious">
            <div className="stat-card-top">
              <span className="stat-label">Suspicious Cases</span>
              <AlertTriangle size={16} className="stat-icon-yellow" />
            </div>
            <span className="stat-value">{liveData.risk_counts["Uncertain / Suspicious"]}</span>
            <span className="stat-footer-text">Elevated caution threshold (45–60%)</span>
          </div>

          <div className="stat-card fraud">
            <div className="stat-card-top">
              <span className="stat-label">Confirmed Fraud</span>
              <ShieldAlert size={16} className="stat-icon-red" />
            </div>
            <span className="stat-value">{liveData.risk_counts["Likely Fraudulent"]}</span>
            <span className="stat-footer-text">High fraud probability (≥60%)</span>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Live Risk Distribution</h3>
              <PieIcon size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={liveData.distribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  innerRadius={50}
                  stroke="#12151A"
                  strokeWidth={2}
                  label
                >
                  {liveData.distribution.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="insight">Real-time breakdown of user-scanned Instagram profiles stored in MongoDB.</p>
          </div>

          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Behavioral Follower-Following Divergence</h3>
              <BarChart3 size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={followerFollowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#20252C" vertical={false} />
                <XAxis dataKey="type" stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Bar dataKey="followers" fill="#FACC15" name="Followers" radius={[4, 4, 0, 0]} />
                <Bar dataKey="follows" fill="#4B5563" name="Following" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="insight">Fraudulent bots exhibit severe follow-churn: mass following with near-zero reciprocal follower return.</p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Historical Benchmark Insights ── */}
      <div className="analytics-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <BarChart3 size={18} className="section-title-icon" />
            <h3 className="section-title">
              <span>Historical</span> Benchmark Patterns
            </h3>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Dataset Training Balance</h3>
              <Users size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={accountDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={45}
                  stroke="#12151A"
                  strokeWidth={2}
                  label
                >
                  {accountDistribution.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="insight">Balanced 5,000-account research benchmark ensuring zero class-imbalance bias.</p>
          </div>

          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Average Post Volume by Profile Class</h3>
              <Image size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#20252C" vertical={false} />
                <XAxis dataKey="type" stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="posts" fill="#FACC15" name="Average Posts" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="insight">Authentic human profiles average 4.5× higher post density compared to disposable fake accounts.</p>
          </div>

          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Profile Picture Distribution (%)</h3>
              <Image size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={profilePicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#20252C" horizontal={false} />
                <XAxis type="number" stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={95} stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Bar dataKey="Genuine" stackId="a" fill="#22C55E" />
                <Bar dataKey="Fraudulent" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
            <p className="insight">80% of identified bot accounts omit custom avatar configuration upon generation.</p>
          </div>

          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>Biography Complexity Trend (%)</h3>
              <FileText size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={descriptionLengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#20252C" />
                <XAxis dataKey="range" stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Line type="monotone" dataKey="Genuine" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Fraudulent" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="insight">Authentic users write descriptive multi-word bios; spam bots frequently leave bios blank.</p>
          </div>

          <div className="analytics-card">
            <div className="card-header-flex">
              <h3>External Link Attachment (%)</h3>
              <LinkIcon size={15} className="card-header-icon" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={externalUrlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#20252C" vertical={false} />
                <XAxis dataKey="name" stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis stroke="#303640" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="Genuine" fill="#22C55E" name="Genuine" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fraudulent" fill="#EF4444" name="Fraudulent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="insight">Legitimate personal brands link to verified portfolios, blogs, and corporate domains.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
