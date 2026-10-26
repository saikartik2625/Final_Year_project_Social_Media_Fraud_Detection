import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { Cpu, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "./ShapForcePlot.css";

// Contextual explanations for each feature when pushing fraud or genuine
const FEATURE_EXPLANATIONS = {
  "profile pic": {
    fraud: "Absence of a profile picture is strongly associated with automated/burner accounts.",
    genuine: "Presence of a verified avatar establishes account legitimacy."
  },
  "nums/length username": {
    fraud: "High ratio of digits in the username indicates randomly generated handle names.",
    genuine: "Clean username with few or no numbers is typical of authentic human creators."
  },
  "fullname words": {
    fraud: "Unusual or empty word count in full name indicates incomplete profile setup.",
    genuine: "Natural multi-word display name resembles genuine personal profiles."
  },
  "nums/length fullname": {
    fraud: "Numbers embedded inside full name are uncommon for real users.",
    genuine: "Alphabetic display name aligns with authentic user patterns."
  },
  "name==username": {
    fraud: "Identical display name and username is often seen in scripted account creation.",
    genuine: "Differentiated display name reflects typical real-world usage."
  },
  "description length": {
    fraud: "Empty or minimal bio suggests lack of real personality or effort.",
    genuine: "Detailed biographical description signals authentic human engagement."
  },
  "external URL": {
    fraud: "Suspicious or missing external website link.",
    genuine: "Inclusion of an external profile or portfolio supports authenticity."
  },
  "private": {
    fraud: "Unusual privacy setting configuration compared to activity levels.",
    genuine: "Privacy setting consistent with normal behavioral profiles."
  },
  "#posts": {
    fraud: "Extremely low or zero post history despite following many accounts.",
    genuine: "Active post history provides tangible proof of genuine content creation."
  },
  "#followers": {
    fraud: "Abnormally low follower count relative to account age and following.",
    genuine: "Established follower base reflects authentic social proof."
  },
  "#follows": {
    fraud: "Mass following with near-zero reciprocal engagement (classic follow-churn bot).",
    genuine: "Balanced following-to-follower ratio indicates genuine organic networking."
  }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isFraud = item.shap_value > 0;
    const color = isFraud ? "#EF4444" : "#22C55E";
    const explanation =
      FEATURE_EXPLANATIONS[item.feature]?.[isFraud ? "fraud" : "genuine"] ||
      (isFraud ? "Pushes prediction toward Fraudulent" : "Pushes prediction toward Genuine");

    return (
      <div className="shap-tooltip">
        <div className="shap-tooltip-header">
          <span className="shap-tooltip-name">{item.display_name}</span>
          <span className="shap-tooltip-val">Input: <strong>{String(item.value)}</strong></span>
        </div>
        <div className="shap-tooltip-impact" style={{ color }}>
          {isFraud ? "▲ +" : "▼ "}
          {(Math.abs(item.shap_value) * 100).toFixed(1)}% {isFraud ? "toward Fraud" : "toward Genuine"}
        </div>
        <p className="shap-tooltip-desc">{explanation}</p>
      </div>
    );
  }
  return null;
};

const ShapForcePlot = ({ shapValues = [], baseValue = 50, finalProbability = 50 }) => {
  const [filter, setFilter] = useState("all");

  const chartData = useMemo(() => {
    if (!shapValues || shapValues.length === 0) return [];

    let list = [...shapValues];

    if (filter === "fraud") {
      list = list.filter((item) => item.shap_value > 0);
    } else if (filter === "genuine") {
      list = list.filter((item) => item.shap_value < 0);
    }

    return [...list].reverse();
  }, [shapValues, filter]);

  const topFeatures = useMemo(() => {
    if (!shapValues || shapValues.length === 0) return [];
    return [...shapValues].slice(0, 3);
  }, [shapValues]);

  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="shap-empty-panel">
        <Cpu size={20} className="shap-empty-icon" />
        <p>KernelSHAP local feature attribution will render here upon scan completion.</p>
      </div>
    );
  }

  return (
    <div className="shap-section">
      <div className="shap-header">
        <div>
          <div className="shap-badge-tag">
            <Cpu size={12} />
            <span>GAME-THEORETIC EXPLAINABILITY (XAI)</span>
          </div>
          <h3 className="shap-title">KernelSHAP Feature Attribution Waterfall</h3>
          <p className="shap-subtitle">
            Local Shapley value decompositions showing the exact directional contribution of each profile feature.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="shap-filters">
          <button
            className={`shap-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Features ({shapValues.length})
          </button>
          <button
            className={`shap-filter-btn fraud-btn ${filter === "fraud" ? "active" : ""}`}
            onClick={() => setFilter("fraud")}
          >
            <span className="dot-indicator dot-red"></span>
            Fraud Drivers
          </button>
          <button
            className={`shap-filter-btn genuine-btn ${filter === "genuine" ? "active" : ""}`}
            onClick={() => setFilter("genuine")}
          >
            <span className="dot-indicator dot-green"></span>
            Genuine Anchors
          </button>
        </div>
      </div>

      {/* Baseline Info Bar */}
      <div className="shap-baseline-bar">
        <div className="baseline-node">
          <span className="node-label">Dataset Prior Base Rate</span>
          <span className="node-val yellow-val">{baseValue}%</span>
        </div>
        <div className="baseline-arrow">→</div>
        <div className="baseline-node center-node">
          <span className="node-label">Net Feature Shift</span>
          <span
            className="node-val"
            style={{ color: finalProbability >= baseValue ? "#EF4444" : "#22C55E" }}
          >
            {finalProbability >= baseValue ? "+" : ""}
            {(finalProbability - baseValue).toFixed(1)}%
          </span>
        </div>
        <div className="baseline-arrow">→</div>
        <div className="baseline-node">
          <span className="node-label">Final Model Prediction</span>
          <span
            className="node-val"
            style={{
              color:
                finalProbability >= 60
                  ? "#EF4444"
                  : finalProbability >= 45
                  ? "#FACC15"
                  : "#22C55E"
            }}
          >
            {finalProbability}%
          </span>
        </div>
      </div>

      {/* Top 3 Drivers Highlight */}
      <div className="shap-top-cards-grid">
        {topFeatures.map((feat, idx) => {
          const isFraud = feat.shap_value > 0;
          const explanation = FEATURE_EXPLANATIONS[feat.feature]?.[isFraud ? "fraud" : "genuine"] || "";
          return (
            <div key={idx} className={`shap-top-card ${isFraud ? "card-fraud" : "card-genuine"}`}>
              <div className="top-card-header">
                <span className="top-card-rank">#{idx + 1} Impact Driver</span>
                <span className={`top-card-pill ${isFraud ? "pill-fraud" : "pill-genuine"}`}>
                  {isFraud ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  <span>{isFraud ? "Fraud Vector" : "Trust Anchor"}</span>
                </span>
              </div>
              <div className="top-card-feature">{feat.display_name}</div>
              <div className="top-card-stat">
                <span className="stat-input-val">Value: <strong>{String(feat.value)}</strong></span>
                <span className="stat-impact-val">
                  {isFraud ? "+" : ""}
                  {(feat.shap_value * 100).toFixed(1)}%
                </span>
              </div>
              <p className="top-card-snippet">{explanation}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Force Bar Chart */}
      <div className="shap-chart-container">
        <div className="chart-legend-row">
          <span className="legend-hint left-hint">← Drives Toward Genuine (Safe)</span>
          <span className="legend-center">0.0 (Base Prior)</span>
          <span className="legend-hint right-hint">Drives Toward Fraud (Alert) →</span>
        </div>

        <div style={{ width: "100%", height: Math.max(320, chartData.length * 36) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
            >
              <XAxis
                type="number"
                domain={[-0.35, 0.35]}
                tickFormatter={(val) => `${val > 0 ? "+" : ""}${(val * 100).toFixed(0)}%`}
                stroke="#303640"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="display_name"
                stroke="#303640"
                tick={{ fill: "#F3F4F6", fontSize: 12, fontWeight: 600 }}
                width={135}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="rgba(250, 204, 21, 0.4)" strokeWidth={1.5} />
              <Bar dataKey="shap_value" radius={[3, 3, 3, 3]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.shap_value > 0 ? "#EF4444" : "#22C55E"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ShapForcePlot;
