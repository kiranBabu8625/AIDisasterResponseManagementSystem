# AI-Based Disaster Response Management System
### Resource Allocation & Relief Coordination

An end-to-end system that predicts disaster resource demand using machine learning, then optimizes resource allocation and delivery routing using operations research (Linear Programming + Vehicle Routing), all surfaced through a live command dashboard.

---

## Project Structure

- app/ — Shared backend modules
  - models.py — SQLAlchemy models (DisasterZone table)
  - database.py — PostgreSQL/PostGIS connection
  - allocation_engine.py — Stage 1: Linear Programming allocation (OR-Tools)
  - routing_engine.py — Stage 2: Vehicle Routing Problem (OR-Tools)
  - priority_override.py — Stage 3: Human-in-the-loop re-optimization
  - mission_assignment.py — Stage 4: Mission/team tracking
  - resource_tracking.py — Stage 5: Delivery logging
  - zones_router.py — Real zone listing endpoint
- prediction_api.py — Milestone 2: ML demand prediction API (port 8010)
- milestone3_api.py — Milestone 3: Combined allocation/routing/etc. API (port 8000)
- models/ — Trained Random Forest models (.pkl files)
- data/ — Synthetic training dataset
- frontend/ — React + Vite dashboard
  - src/Dashboard.jsx — Main command dashboard
  - src/RealDashboard.jsx — "Live Data" page, real DB + real ML integration
  - src/ZoneMap.jsx — Leaflet map with routes and zone popups
- start_demo.sh — One-command script to launch everything

---

## How to Run

### Option A: One command (recommended)

    ./start_demo.sh

This opens 3 Terminal windows automatically (Milestone 3 API, Prediction API, and the React frontend). Wait 5-10 seconds, then open http://localhost:5173.

### Option B: Manual (3 separate terminals)

Terminal 1 — Milestone 3 API (allocation, routing, priority override, missions, tracking)

    source venv/bin/activate
    uvicorn milestone3_api:app --reload --port 8000

Terminal 2 — Prediction API (Milestone 2 ML model)

    source venv/bin/activate
    uvicorn prediction_api:app --reload --port 8010

Terminal 3 — Frontend

    cd frontend
    npm run dev

Then open http://localhost:5173 in your browser.

---

## Dashboard Pages

- Dashboard — Command center: AI recommendations, stats, map, demand vs. allocated, alerts summary
- Live Data — Real end-to-end proof: real zones from the database, real ML predictions, real allocation results
- Disaster Zones — Detailed cards per zone
- Resources — Inventory control, priority overrides, field delivery logging
- Missions — Dispatch, routing map, mission status, driver/vehicle details
- Alerts — Auto-generated shortage alerts with reallocate/view actions

---

## Adding More Zones to the Real Database

    python3 insert_more_zones.py

Edit that file to add more DisasterZone entries with your own zone_id, disaster_type, severity_score, latitude/longitude, etc.

---

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL + PostGIS
- ML: scikit-learn (Random Forest regression), trained on synthetic disaster data
- Optimization: Google OR-Tools (Linear Programming for allocation, Vehicle Routing Problem for logistics)
- Frontend: React + Vite, Leaflet.js (maps), Axios

---

## Notes

- Mission and delivery-tracking data is stored in-memory and resets when the backend restarts. In production this would be backed by PostgreSQL, same as the zones table.
- The main Dashboard page uses sample zone data (Z-101/102/103) to reliably demonstrate optimization trade-offs. The Live Data page uses only real zones from the database (Z0001-Z0004) and calls the real trained ML model for predictions.
