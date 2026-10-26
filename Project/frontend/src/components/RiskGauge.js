import React, { useId } from "react";
import "./RiskGauge.css";

const RiskGauge = ({ probability = 0, riskLevel = "Likely Genuine" }) => {
  const rawClamped = Math.max(0, Math.min(100, Number(probability) || 0));
  const gradientId = useId().replace(/:/g, "");

  // Needle rotation: 0% is -90deg, 50% is 0deg, 100% is 90deg
  const needleAngle = -90 + (rawClamped / 100) * 180;

  // BLACKOUT Risk Colors
  let statusClass = "gauge-genuine";
  let statusColor = "#22C55E"; // Low risk
  if (rawClamped >= 60) {
    statusClass = "gauge-fraud";
    statusColor = "#EF4444"; // High risk
  } else if (rawClamped >= 45) {
    statusClass = "gauge-suspicious";
    statusColor = "#FACC15"; // Medium risk (Electric Yellow)
  }

  return (
    <div className={`risk-gauge-container ${statusClass}`}>
      <div className="risk-gauge-header">
        <span className="gauge-title-badge">{"// CALIBRATED POSTERIOR PROBABILITY"}</span>
        <span className="gauge-risk-pill" style={{ borderColor: statusColor, color: statusColor }}>
          {riskLevel}
        </span>
      </div>

      <div className="risk-gauge-svg-wrap">
        <svg viewBox="0 0 240 140" className="risk-gauge-svg" aria-label={`Risk gauge showing ${rawClamped}%`}>
          <defs>
            <linearGradient id={`gaugeGradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="42%" stopColor="#22C55E" />
              <stop offset="48%" stopColor="#FACC15" />
              <stop offset="58%" stopColor="#FACC15" />
              <stop offset="65%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            <filter id={`needleGlow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={statusColor} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#12151A"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored tier arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke={`url(#gaugeGradient-${gradientId})`}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Tier Divider Marker Lines */}
          <line
            x1="86" y1="36" x2="82" y2="24"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
          />
          <line
            x1="128" y1="21" x2="130" y2="9"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
          />

          {/* Needle Indicator */}
          <g
            className="gauge-needle-group"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: "120px 120px",
              transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <path
              d="M 117 120 L 120 26 L 123 120 Z"
              fill={statusColor}
              filter={`url(#needleGlow-${gradientId})`}
            />
          </g>

          {/* Center Pivot Dot */}
          <circle cx="120" cy="120" r="10" fill="#080A0D" stroke={statusColor} strokeWidth="3" />
          <circle cx="120" cy="120" r="4" fill="#F3F4F6" />
        </svg>

        {/* Big Score Readout */}
        <div className="gauge-readout">
          <span className="gauge-percentage" style={{ color: statusColor }}>
            {rawClamped}%
          </span>
          <span className="gauge-label">Fraud Probability</span>
        </div>
      </div>

      {/* Tier Legend Bar */}
      <div className="gauge-tier-legend">
        <div className={`tier-tag tier-genuine ${rawClamped < 45 ? "active-tier" : ""}`}>
          <span className="tier-dot genuine-dot"></span>
          <span className="tier-name">Genuine</span>
          <span className="tier-range">&lt;45%</span>
        </div>
        <div className={`tier-tag tier-suspicious ${rawClamped >= 45 && rawClamped < 60 ? "active-tier" : ""}`}>
          <span className="tier-dot suspicious-dot"></span>
          <span className="tier-name">Suspicious</span>
          <span className="tier-range">45–60%</span>
        </div>
        <div className={`tier-tag tier-fraud ${rawClamped >= 60 ? "active-tier" : ""}`}>
          <span className="tier-dot fraud-dot"></span>
          <span className="tier-name">Fraudulent</span>
          <span className="tier-range">≥60%</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
