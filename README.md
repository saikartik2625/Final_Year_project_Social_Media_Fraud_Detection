# 🛡️ Social Media Fraud Detection & Explainable AI Platform

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SHAP](https://img.shields.io/badge/XAI-KernelSHAP-blueviolet)](https://github.com/slundberg/shap)
[![Accuracy](https://img.shields.io/badge/Test%20Accuracy-93.56%25-brightgreen)](https://github.com/saikartik2625/Final_Year_project_Social_Media_Fraud_Detection)
[![Recall](https://img.shields.io/badge/Fraud%20Recall-96.16%25-success)](https://github.com/saikartik2625/Final_Year_project_Social_Media_Fraud_Detection)

An end-to-end cybersecurity intelligence platform engineered to detect automated bot farms, deceptive identity impersonators, and fraudulent profiles on **Instagram**. 

The system couples **Zero-Authentication Real-Time Client-Side GraphQL Scraping**, an optimized **Multilayer Perceptron (MLP) Deep Neural Network**, **Cooperative Game-Theoretic Explainability (KernelSHAP)**, and a **Transformer-based Generative AI Security Advisor (LLaMA/Qwen via Groq)** into a responsive full-stack cybersecurity web application.

---

## 🚀 Key Highlights & Novelties

- ⚡ **Zero-Credential Real-Time Ingestion:** Reverse-engineers Instagram's client-side embedded GraphQL data structures (`<script type="application/json">`) using browser-emulated HTTP navigation headers. Extracts exact, unrounded single-digit follower and following counts in **<1 second** with zero login-walls, passwords, or paid API keys.
- 🧠 **Deep Neural Network Classification:** Trained on behavioral and structural metadata across 11 key telemetry attributes, reaching **93.56% Test Accuracy** and **96.16% Fraud Recall** on 994 unseen test profiles.
- 🔍 **Explainable AI (XAI) via KernelSHAP:** Eliminates the "black-box" dilemma of deep learning. Uses cooperative game theory (Shapley Values) to compute real-time local positive and negative feature attributions, visually explaining *why* an account was flagged.
- 🤖 **Generative AI Security Advisor:** Translates complex numerical probabilities and SHAP attributions into human-readable cybersecurity debriefs and an interactive security assistant.
- 📄 **Forensic PDF Audit Export:** One-click generation of tamper-evident, publication-ready cyber forensics PDF reports using ReportLab.
- 🛡️ **Fault-Tolerant Resilience:** Dual-engine database architecture (seamless auto-fallback between MongoDB and SQLite) and offline Viva demo benchmarks.

---

## 🏗️ System Architecture

```
                  ┌──────────────────────────────────────────────────┐
                  │          Target Profile URL or Username          │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │    Tier 1: Embedded Client GraphQL Extractor     │
                  │   (Fallbacks: OpenGraph Crawler / Greatfon CDN)  │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                            ▼ (11 Behavioral Features)
                  ┌──────────────────────────────────────────────────┐
                  │       Feature Standardization (StandardScaler)   │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │   Multilayer Perceptron (MLP Deep Neural Net)    │
                  │  [Input(11) ➔ Dense(64) ➔ Dense(32) ➔ Sigmoid]  │
                  └────────────────────┬───────────┬─────────────────┘
                                       │           │
                 ┌─────────────────────┘           └─────────────────┐
                 ▼                                                   ▼
     Calibrated Fraud Risk %                             KernelSHAP Game Theory
       (Low / Med / High)                               Feature Attributions (XAI)
                 │                                                   │
                 └─────────────────────┬─────────────────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────────────┐
                  │     Transformer LLM Security Advisor (Groq)      │
                  │      [Contextual Incident Debrief & Report]      │
                  └─────────────────────────┬────────────────────────┘
                                            │
                                            ▼
                  ┌──────────────────────────────────────────────────┐
                  │   Full-Stack Dashboard (React 18 + Flask REST)   │
                  │     • Risk Gauge & Interactive SHAP Visuals      │
                  │     • AI Safety Chat & Downloadable PDF Report   │
                  └──────────────────────────────────────────────────┘
```

---

## 📊 The 11 Behavioral & Structural Attributes

| Feature | Attribute Name | Technical Description |
| :---: | :--- | :--- |
| **F1** | `profile pic` | Binary flag ($1$ if profile picture is uploaded, $0$ otherwise) |
| **F2** | `nums/length username` | Ratio of numeric digits to total username character length |
| **F3** | `fullname words` | Count of discrete space-delimited words in the display name |
| **F4** | `nums/length fullname` | Ratio of numeric digits to total display name length |
| **F5** | `name==username` | Binary flag ($1$ if username is identical to display name, $0$ otherwise) |
| **F6** | `description length` | Total character count of biographical description / bio |
| **F7** | `external URL` | Binary flag ($1$ if external bio URL or link tree is present) |
| **F8** | `private` | Binary flag ($1$ for private accounts, $0$ for public) |
| **F9** | `#posts` | Total media posts published on timeline |
| **F10** | `#followers` | Total incoming follower count |
| **F11** | `#follows` | Total outgoing following count |

---

## 📈 Empirical Performance & Evaluation

Evaluated against an independent, unseen test partition of **994 real-world accounts** (`social_media_test.csv`):

| Evaluation Metric | Score | Industrial Context |
| :--- | :---: | :--- |
| **Overall Accuracy** | **93.56%** | Correctly classified 930 out of 994 unseen accounts |
| **Fraud Recall (Sensitivity)** | **96.16%** | Catches 96 out of every 100 fraudulent bots |
| **Fraud Precision** | **91.36%** | High certainty when flagging suspicious accounts |
| **Macro F1-Score** | **93.70%** | Balanced harmonic mean across skewed distributions |
| **Inference Latency** | **< 5 ms** | Ultra-lightweight forward pass (2,881 parameters) |

### Confusion Matrix:

```
                      PREDICTED GENUINE    PREDICTED FRAUD
ACTUAL GENUINE (499)        454                  45
ACTUAL FRAUD   (495)         19                 476
```

---

## 💻 Tech Stack

- **Machine Learning & Deep Learning:** TensorFlow, Keras, Scikit-Learn, NumPy, Pandas, Joblib
- **Explainable AI (XAI):** KernelSHAP (Shapley Additive exPlanations)
- **Generative AI / LLM:** Groq API (LLaMA-3.3 70B / Qwen-2.5)
- **Backend API:** Python 3.11, Flask, Flask-CORS, Gunicorn
- **Database:** SQLite (`fraud_intel.db`) with automatic MongoDB fallback
- **Frontend UI:** React.js 18, React Router, Recharts, Lucide Icons, Custom Cybersecurity Theme
- **Data Ingestion:** Real-Time Embedded GraphQL & OpenGraph Protocol Scraper
- **Forensic Export:** ReportLab PDF Engine

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.10+ / 3.11**
- **Node.js 16+ & npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/saikartik2625/Final_Year_project_Social_Media_Fraud_Detection.git
cd Final_Year_project_Social_Media_Fraud_Detection
```

### 2. Backend Setup
```bash
cd Project/backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your GROQ_API_KEY (optional for AI insights)
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Running the Application

- **Option A — Single Launcher (Mac/Linux):**
  ```bash
  # From project root directory
  ./start_app.sh
  ```

- **Option B — Manual Launch:**
  ```bash
  # Terminal 1 (Backend on port 7860):
  cd Project/backend
  source venv/bin/activate
  python app.py

  # Terminal 2 (Frontend on port 3000):
  cd Project/frontend
  npm start
  ```

Access the dashboard in your browser at: **`http://localhost:3000`**

---

## 👤 Pre-Seeded Analyst Demo Credentials

For quick evaluation and offline viva presentations:
- **Email:** `analyst@blackout.io`
- **Password:** `Blackout@2026`

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author
**Sai Kartik**  
- GitHub: [@saikartik2625](https://github.com/saikartik2625)
