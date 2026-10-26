import os
import sys

# Ensure Keras has a writable directory in all environments
if "KERAS_HOME" not in os.environ:
    os.environ["KERAS_HOME"] = "/tmp/.keras"
try:
    os.makedirs(os.environ["KERAS_HOME"], exist_ok=True)
except Exception:
    pass

import sqlite3
import json
from flask import Flask, request, jsonify, send_file
from report_generator import generate_pdf_report
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import shap
try:
    from keras.models import load_model
except ImportError:
    from tensorflow.keras.models import load_model  # type: ignore
from dotenv import load_dotenv

# Feature names (must match training order)
FEATURE_NAMES = [
    "profile pic", "nums/length username", "fullname words",
    "nums/length fullname", "name==username", "description length",
    "external URL", "private", "#posts", "#followers", "#follows"
]

DISPLAY_NAMES = {
    "profile pic": "Profile Picture",
    "nums/length username": "Username Digit Ratio",
    "fullname words": "Full Name Words",
    "nums/length fullname": "Full Name Digit Ratio",
    "name==username": "Name = Username",
    "description length": "Bio Length",
    "external URL": "External URL",
    "private": "Private Account",
    "#posts": "Posts",
    "#followers": "Followers",
    "#follows": "Following"
}

# Load environment variables from .env file
load_dotenv()

# 🔹 MongoDB
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

# 🔹 Email & Background Tasks
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# -----------------------------
# Resilient Database Manager (MongoDB + SQLite Auto-Fallback)
# -----------------------------
class DatabaseManager:
    def __init__(self, mongo_uri="mongodb://localhost:27017/"):
        self.use_mongo = False
        self.client = None
        self.users = None
        self.predictions = None
        self.sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fraud_intel.db")

        # Try connecting to MongoDB with a quick 1.5s timeout
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
            self.client.admin.command("ping")
            db = self.client["fraud_detection_db"]
            self.users = db["users"]
            self.predictions = db["predictions"]
            self.use_mongo = True
            print(" Connected to MongoDB successfully!")
        except Exception as e:
            print(f" MongoDB unavailable ({e}). Automatically using resilient SQLite storage at: {self.sqlite_path}")
            self._init_sqlite()

    def _init_sqlite(self):
        try:
            with sqlite3.connect(self.sqlite_path) as conn:
                c = conn.cursor()
                c.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    )
                """)
                c.execute("""
                    CREATE TABLE IF NOT EXISTS predictions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT,
                        probability REAL,
                        risk_level TEXT,
                        features TEXT,
                        ai_insight TEXT,
                        shap_values TEXT
                    )
                """)
                # Pre-seed a default demo security analyst account if empty
                c.execute("SELECT COUNT(*) FROM users")
                if c.fetchone()[0] == 0:
                    c.execute(
                        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                        ("Security Analyst", "analyst@blackout.io", generate_password_hash("Blackout@2026"))
                    )
                conn.commit()
        except Exception as e:
            print(f"⚠️ SQLite initialization warning: {e}")

    def find_user_by_email(self, email):
        if self.use_mongo:
            try:
                user = self.users.find_one({"email": email})
                if user:
                    return dict(user)
                return None
            except Exception as e:
                print(f"⚠️ MongoDB query failed, falling back to SQLite: {e}")
                self.use_mongo = False
                self._init_sqlite()

        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = c.fetchone()
            if row:
                return dict(row)
            return None

    def create_user(self, username, email, hashed_password):
        if self.use_mongo:
            try:
                self.users.insert_one({
                    "username": username,
                    "email": email,
                    "password": hashed_password
                })
                return True
            except Exception as e:
                print(f"⚠️ MongoDB insert failed, falling back to SQLite: {e}")
                self.use_mongo = False
                self._init_sqlite()

        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, hashed_password)
            )
            conn.commit()
            return True

    def save_prediction(self, record):
        if self.use_mongo:
            try:
                self.predictions.insert_one(record)
                return True
            except Exception as e:
                print(f"⚠️ MongoDB save failed, falling back to SQLite: {e}")
                self.use_mongo = False
                self._init_sqlite()

        try:
            with sqlite3.connect(self.sqlite_path) as conn:
                c = conn.cursor()
                c.execute(
                    """INSERT INTO predictions (timestamp, probability, risk_level, features, ai_insight, shap_values)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        record.get("timestamp"),
                        record.get("probability"),
                        record.get("risk_level"),
                        json.dumps(record.get("features", {})),
                        record.get("ai_insight", ""),
                        json.dumps(record.get("shap_values", []))
                    )
                )
                conn.commit()
                return True
        except Exception as e:
            print(f"⚠️ Could not save prediction to SQLite: {e}")
            return False

    def get_all_predictions(self):
        if self.use_mongo:
            try:
                return list(self.predictions.find({}, {"_id": 0}))
            except Exception as e:
                print(f"⚠️ MongoDB fetch failed, falling back to SQLite: {e}")
                self.use_mongo = False
                self._init_sqlite()

        try:
            with sqlite3.connect(self.sqlite_path) as conn:
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM predictions")
                rows = c.fetchall()
                results = []
                for r in rows:
                    item = dict(r)
                    try:
                        item["features"] = json.loads(item.get("features") or "{}")
                    except Exception:
                        pass
                    try:
                        item["shap_values"] = json.loads(item.get("shap_values") or "[]")
                    except Exception:
                        pass
                    results.append(item)
                return results
        except Exception as e:
            print(f"⚠️ Could not fetch predictions from SQLite: {e}")
            return []

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_manager = DatabaseManager(MONGO_URI)

# -----------------------------
# Email Configuration (SECURE)
# -----------------------------
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# -----------------------------
# Load model and scaler
# -----------------------------
MODEL_PATH = os.path.join("models", "fraud_detection_model.h5")
SCALER_PATH = os.path.join("models", "scaler.pkl")

model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# -----------------------------
# SHAP Explainer Setup
# -----------------------------
shap_explainer = None
try:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    TRAIN_CSV = os.path.join(SCRIPT_DIR, "..", "..", "CSV_Files", "social_media_train.csv")
    if os.path.exists(TRAIN_CSV):
        train_df = pd.read_csv(TRAIN_CSV)
        X_bg = train_df[FEATURE_NAMES].values[:100]
        X_bg_scaled = scaler.transform(X_bg)

        def model_predict_fn(x):
            return model.predict(x, verbose=0).flatten()

        shap_explainer = shap.KernelExplainer(model_predict_fn, shap.sample(X_bg_scaled, 25))
        print("✅ SHAP KernelExplainer initialized successfully")
    else:
        print(f"⚠️ Training CSV not found at {TRAIN_CSV}, SHAP disabled")
except Exception as e:
    print(f"⚠️ SHAP initialization failed (predictions still work): {e}")

# -----------------------------
# Email helper function
# -----------------------------
def send_alert_email(receiver_email, risk_level, probability):
    subject = "⚠️ Fraud Alert Notification"

    body = f"""
Hello,

You searched a social media account using the Social Media Fraud Detection System.

⚠️ Risk Assessment Result:
Risk Level: {risk_level}
Fraud Probability: {probability:.2f}%

Recommendation:
Please avoid interacting with this account and proceed with caution.

This is an automated alert generated for your safety.

Regards,
Social Media Fraud Detection System
"""
    import requests
    
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": os.getenv('BREVO_API_KEY'),
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    
    payload = {
        "sender": {"name": "Security Alert", "email": "sanyu.p.singareddy@gmail.com"},
        "to": [{"email": receiver_email}],
        "subject": subject,
        "textContent": body
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print(f"📧 Alert email sent to {receiver_email} via Brevo")
        else:
            print(f"❌ Brevo API Error ({response.status_code}):", response.text)
    except Exception as e:
        print(f"❌ Email sending failed ({receiver_email}):", e)

# -----------------------------
# Health check
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Backend running with ML + MongoDB + Email alerts"
    })

# -----------------------------
# User Registration
# -----------------------------
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json or {}
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not username or not email or not password:
            return jsonify({"error": "All fields (Username, Email, Password) are required."}), 400

        existing_user = db_manager.find_user_by_email(email)
        if existing_user:
            return jsonify({"error": "An account with this email address already exists."}), 400

        hashed_password = generate_password_hash(password)
        db_manager.create_user(username, email, hashed_password)

        return jsonify({"message": "User registered successfully", "username": username, "email": email}), 201
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

# -----------------------------
# User Login
# -----------------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Both email and password are required."}), 400

        user = db_manager.find_user_by_email(email)

        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password. Please verify your credentials."}), 401

        return jsonify({
            "message": "Login successful",
            "username": user["username"],
            "email": user["email"]
        }), 200
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"error": f"Authentication server error: {str(e)}"}), 500

# -----------------------------
# AI Provider (Groq-Powered)
# -----------------------------
from ai_helper import get_fraud_insight, get_chat_response

# -----------------------------
# Instagram Profile Auto-Fetch API
# -----------------------------
from instagram_fetcher import fetch_instagram_profile

@app.route("/fetch_instagram", methods=["POST"])
def fetch_instagram():
    data = request.json or {}
    url = data.get("url") or data.get("username", "")
    if not url:
        return jsonify({"success": False, "error": "Instagram URL or username is required"}), 400
    
    result = fetch_instagram_profile(url)
    return jsonify(result)

# -----------------------------
# Prediction API
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    user_email = data.get("user_email")

    features = [
        data["profile pic"],
        data["nums/length username"],
        data["fullname words"],
        data["nums/length fullname"],
        data["name==username"],
        data["description length"],
        data["external URL"],
        data["private"],
        data["#posts"],
        data["#followers"],
        data["#follows"]
    ]

    features = np.array(features).reshape(1, -1)
    features_scaled = scaler.transform(features)

    probability = float(model.predict(features_scaled)[0][0])

    if probability < 0.45:
        risk_level = "Likely Genuine"
        message = "This account appears safe based on behavioral patterns."
    elif probability < 0.60:
        risk_level = "Uncertain / Suspicious"
        message = "This account shows suspicious behavior. Use caution."
    else:
        risk_level = "Likely Fraudulent"
        message = "High fraud risk detected. Avoid interacting with this account."

    # 🤖 Get AI Insights (Groq-Powered)
    ai_insight = get_fraud_insight(data, risk_level, round(probability * 100, 2))

    # 🔔 Send email ONLY if suspicious or fraudulent (Now in BACKGROUND thread for 2s speed!)
    if user_email and risk_level != "Likely Genuine":
        email_thread = threading.Thread(
            target=send_alert_email,
            args=(user_email, risk_level, probability * 100)
        )
        email_thread.daemon = True
        email_thread.start()

    # 🔬 Compute SHAP feature contributions
    shap_data = []
    base_val = 0.5
    if shap_explainer is not None:
        try:
            raw_shap = shap_explainer.shap_values(features_scaled, nsamples=60)
            vals = raw_shap[0] if hasattr(raw_shap, '__len__') and len(raw_shap.shape) > 1 else raw_shap
            if hasattr(shap_explainer, "expected_value"):
                ev = shap_explainer.expected_value
                base_val = float(ev[0]) if hasattr(ev, '__len__') else float(ev)

            raw_feature_values = [
                data.get("profile pic", 0),
                data.get("nums/length username", 0),
                data.get("fullname words", 0),
                data.get("nums/length fullname", 0),
                data.get("name==username", 0),
                data.get("description length", 0),
                data.get("external URL", 0),
                data.get("private", 0),
                data.get("#posts", 0),
                data.get("#followers", 0),
                data.get("#follows", 0)
            ]

            for i, feat_name in enumerate(FEATURE_NAMES):
                s_val = float(vals[i])
                f_val = raw_feature_values[i]
                direction = "fraud" if s_val > 0.005 else ("genuine" if s_val < -0.005 else "neutral")
                shap_data.append({
                    "feature": feat_name,
                    "display_name": DISPLAY_NAMES.get(feat_name, feat_name),
                    "value": f_val,
                    "shap_value": round(s_val, 4),
                    "direction": direction,
                    "abs_impact": round(abs(s_val), 4)
                })

            # Sort descending by absolute impact so highest contributors are first
            shap_data.sort(key=lambda x: x["abs_impact"], reverse=True)
        except Exception as e:
            print(f"⚠️ SHAP explanation computation error: {e}")

    # 💾 Save prediction for analytics
    from datetime import datetime
    try:
        db_manager.save_prediction({
            "timestamp": datetime.now().isoformat(),
            "probability": probability,
            "risk_level": risk_level,
            "features": data,
            "ai_insight": ai_insight,
            "shap_values": shap_data
        })
    except Exception as db_err:
        print(f"⚠️ Warning: Could not save prediction record: {db_err}")

    return jsonify({
        "probability": round(probability * 100, 2),
        "risk_level": risk_level,
        "message": message,
        "ai_insight": ai_insight,
        "shap_values": shap_data,
        "base_value": round(base_val * 100, 2)
    })

# -----------------------------
# AI Chat Helper
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    history = data.get("history", [])
    context = data.get("context") # Get prediction context if available
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
        
    response = get_chat_response(user_message, history, context)
    return jsonify({"response": response})

# -----------------------------
# Analytics API
# -----------------------------
@app.route("/analytics", methods=["GET"])
def get_analytics():
    try:
        # Fetch all predictions via resilient db manager
        all_predictions = db_manager.get_all_predictions()
        
        total_analyzed = len(all_predictions)
        
        # Risk Level Breakdown
        risk_counts = {
            "Likely Genuine": 0,
            "Uncertain / Suspicious": 0,
            "Likely Fraudulent": 0
        }
        
        for pred in all_predictions:
            lvl = pred.get("risk_level")
            if lvl in risk_counts:
                risk_counts[lvl] += 1
                
        # Prepare chart data for frontend
        account_distribution = [
            {"name": "Genuine", "value": risk_counts["Likely Genuine"]},
            {"name": "Fraudulent", "value": risk_counts["Likely Fraudulent"] + risk_counts["Uncertain / Suspicious"]}
        ]
        
        return jsonify({
            "total": total_analyzed,
            "risk_counts": risk_counts,
            "distribution": account_distribution
        })
    except Exception as e:
        print("❌ Analytics fetch failed:", e)
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Report Download API
# -----------------------------
@app.route("/download_report", methods=["POST"])
def download_report():
    data = request.json
    
    # Generate PDF
    pdf_buffer = generate_pdf_report(data)
    
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name="fraud_detection_report.pdf",
        mimetype="application/pdf"
    )

# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"🔥 Starting Flask backend on port {port} 🔥")
    app.run(debug=False, host="0.0.0.0", port=port)
