#!/bin/bash
# ==============================================================================
# BLACKOUT Fraud Detection - Full Stack Launcher
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "🛡️  BLACKOUT CYBERSECURITY - STARTING FULL APPLICATION"
echo "=========================================================="

# 1. Start Backend in background
"$PROJECT_ROOT/start_backend.sh" &
BACKEND_PID=$!

echo "⏳ Waiting 3 seconds for backend to initialize on :7860..."
sleep 3

# 2. Start Frontend
cd "$PROJECT_ROOT/Project/frontend" || exit 1
echo "⚛️  Starting React frontend on http://localhost:3000..."
npm start

# Kill backend when frontend exits
kill "$BACKEND_PID" 2>/dev/null

