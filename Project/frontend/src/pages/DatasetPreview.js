import React from "react";
import {
  Database,
  Image as ImageIcon,
  Hash,
  FileSpreadsheet,
  Users,
  UserPlus,
  Scale,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Layers,
  Cpu
} from "lucide-react";
import "./DatasetPreview.css";

const DatasetPreview = () => {
  const sampleData = [
    {
      profilePic: 1,
      usernameRatio: 0.12,
      posts: 145,
      followers: 2450,
      follows: 180,
      fake: 0
    },
    {
      profilePic: 0,
      usernameRatio: 0.65,
      posts: 2,
      followers: 12,
      follows: 1250,
      fake: 1
    },
    {
      profilePic: 1,
      usernameRatio: 0.0,
      posts: 89,
      followers: 950,
      follows: 340,
      fake: 0
    },
    {
      profilePic: 0,
      usernameRatio: 0.88,
      posts: 0,
      followers: 5,
      follows: 2300,
      fake: 1
    }
  ];

  const features = [
    {
      title: "Profile Avatar Asset",
      icon: <ImageIcon size={18} className="feat-icon" />,
      desc: "Binary marker verifying avatar presence. Scripted bots consistently skip avatar initialization.",
      tag: "Binary [0,1]"
    },
    {
      title: "Handle Digit Entropy",
      icon: <Hash size={18} className="feat-icon" />,
      desc: "Ratio of numeric characters in username. High entropy signals auto-generated handle names.",
      tag: "Continuous [0–1]"
    },
    {
      title: "Content Density (#Posts)",
      icon: <FileSpreadsheet size={18} className="feat-icon" />,
      desc: "Chronological post volume. Authentic accounts maintain a persistent content trail over time.",
      tag: "Integer [Count]"
    },
    {
      title: "Community Reach (Followers)",
      icon: <Users size={18} className="feat-icon" />,
      desc: "Organic audience footprint. Bot farms struggle to cultivate authentic non-reciprocal followers.",
      tag: "Integer [Count]"
    },
    {
      title: "Aggressive Following (Follows)",
      icon: <UserPlus size={18} className="feat-icon" />,
      desc: "Follow-churn behavior. High follow numbers paired with few followers is a core anomaly vector.",
      tag: "Integer [Count]"
    },
    {
      title: "Target Class Ground Truth",
      icon: <Scale size={18} className="feat-icon" />,
      desc: "Supervised binary target: Genuine (0) vs. Fraudulent/Bot (1) verified by research benchmarks.",
      tag: "Label [0 / 1]"
    }
  ];

  return (
    <div className="dataset-container">
      <header className="dataset-header">
        <div className="badge-banner">
          <Database size={13} />
          <span>RESEARCH TAXONOMY &amp; BENCHMARK REPOSITORY</span>
        </div>
        <h2>Dataset Architecture</h2>
        <p className="subtitle">
          Engineered behavioral vectors and ground-truth feature taxonomy utilized to train the Deep Multilayer Perceptron.
        </p>
      </header>

      <div className="content-grid">
        {/* Left Section: Context & Research */}
        <section className="context-section">
          <div className="glass-card main-info">
            <div className="info-header-tag">
              <Cpu size={14} /> METHODOLOGY SPECIFICATION
            </div>
            <h3 className="context-title">Feature Engineering &amp; Normalization</h3>
            <p>
              The fraud classification engine operates on 11 standardized attributes. Each sample captures a digital fingerprint spanning handle entropy, following divergence, and profile completeness.
            </p>

            <div className="meta-info">
              <div className="meta-item">
                <span className="meta-label">Total Corpus</span>
                <span className="meta-value">5,000 Verified Accounts</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Preprocessing</span>
                <span className="meta-value">Z-Score StandardScaler</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Cross Validation</span>
                <span className="meta-value">5-Fold Stratified Split</span>
              </div>
            </div>

            <div className="research-tip">
              <strong>Notice:</strong> All data is anonymized and balanced 50/50 between authentic creators and automated bot profiles to eliminate class bias.
            </div>
          </div>
        </section>

        {/* Right Section: Feature Breakdown */}
        <section className="features-section">
          <h3 className="section-subtitle">{"// BEHAVIORAL INDICATORS"}</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-box">{feature.icon}</div>
                <div className="feature-content">
                  <div className="feature-title-row">
                    <h4>{feature.title}</h4>
                    <span className="feature-tag">{feature.tag}</span>
                  </div>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Section: Data Sample */}
      <section className="preview-section">
        <div className="preview-header">
          <div className="preview-header-left">
            <Layers size={16} className="preview-icon" />
            <div>
              <h3>Sample Vector Preview</h3>
              <p>Direct view of raw feature vectors ingested by the neural network.</p>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="dataset-table">
            <thead>
              <tr>
                <th>Profile Avatar</th>
                <th>Handle Digit Ratio</th>
                <th>Post Volume</th>
                <th>Followers</th>
                <th>Following</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, index) => (
                <tr key={index}>
                  <td>
                    <span className={row.profilePic ? "status-yes" : "status-no"}>
                      {row.profilePic ? <Check size={13} /> : <X size={13} />}
                      {row.profilePic ? "Present" : "Missing"}
                    </span>
                  </td>
                  <td className="mono-cell">{(row.usernameRatio * 100).toFixed(0)}%</td>
                  <td className="mono-cell">{row.posts}</td>
                  <td className="mono-cell">{row.followers.toLocaleString()}</td>
                  <td className="mono-cell">{row.follows.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${row.fake ? "fraud" : "genuine"}`}>
                      {row.fake ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                      {row.fake ? "Confirmed Fraud" : "Confirmed Genuine"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DatasetPreview;
