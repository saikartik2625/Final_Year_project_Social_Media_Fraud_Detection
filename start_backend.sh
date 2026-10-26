#!/bin/bash
# ==============================================================================
# BLACKOUT Fraud Detection - Backend Startup Script
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Project/backend"

echo "=========================================================="
echo "🛡️  STARTING BLACKOUT FRAUD INTEL BACKEND"
echo "=========================================================="
echo "📂 Backend Directory: $BACKEND_DIR"

cd "$BACKEND_DIR" || exit 1

# Ensure virtualenv exists
if [ -d "venv" ]; then
    echo "🐍 Activating Python virtual environment..."
    PYTHON_EXEC="./venv/bin/python"
else
    echo "⚠️  venv not found in Project/backend, using system python3..."
    PYTHON_EXEC="python3"
fi

# Set safe Keras directory
export KERAS_HOME="${KERAS_HOME:-/tmp/.keras}"
mkdir -p "$KERAS_HOME"

# Check if port 7860 is already in use and free it
EXISTING_PID=$(lsof -ti :7860 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "⚠️  Port 7860 is currently held by PID $EXISTING_PID. Stopping it..."
    kill -9 "$EXISTING_PID" 2>/dev/null
    sleep 1
fi

echo "🚀 Launching Flask API on http://127.0.0.1:7860..."
echo "👉 Health Check: http://127.0.0.1:7860/"
echo "👉 Login Endpoint: http://127.0.0.1:7860/login"
echo "----------------------------------------------------------"
echo "Pre-seeded Analyst Credentials:"
echo "   Email:    analyst@blackout.io"
echo "   Password: Blackout@2026"
echo "=========================================================="

"$PYTHON_EXEC" app.py

