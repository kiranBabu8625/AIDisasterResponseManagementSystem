#!/bin/bash

PROJECT_DIR="/Users/saiganeshbobbili/AI-Based-Disaster-Response-Management-System-for-Resource-Allocation---Relief-Coordination-July-2026"

osascript <<APPLESCRIPT
tell application "Terminal"
    do script "cd '$PROJECT_DIR' && source venv/bin/activate && echo '=== MILESTONE 3 API (port 8000) ===' && uvicorn milestone3_api:app --reload --port 8000"
    delay 1
    do script "cd '$PROJECT_DIR' && source venv/bin/activate && echo '=== PREDICTION API (port 8010) ===' && uvicorn prediction_api:app --reload --port 8010"
    delay 1
    do script "cd '$PROJECT_DIR/frontend' && echo '=== FRONTEND (port 5173) ===' && npm run dev"
end tell
APPLESCRIPT

echo "All three servers are starting in separate Terminal windows."
echo "Wait about 5-10 seconds, then open: http://localhost:5173"
