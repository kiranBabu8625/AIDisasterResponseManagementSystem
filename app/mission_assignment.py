"""
Milestone 3 - Stage 4: Mission Assignment Engine
====================================================
Takes the routes planned in Stage 2 (or re-planned in Stage 3) and
assigns each route to a real response team. Tracks status per mission.

This is intentionally simple - no optimization here, just record-keeping.
Uses an in-memory store for now (a Python dict). Swap this for a real
PostGIS/Postgres table later; the function signatures won't need to change.
"""

from datetime import datetime, timezone

# In-memory "database" - resets when the server restarts.
# Replace with real DB writes later (same pattern as your other modules).
_missions_db: dict[str, dict] = {}
_next_mission_id = 1


def create_missions(routes: list[dict], team_names: dict[int, str]) -> list[dict]:
    """
    routes: the "routes" list from routing_engine.py's plan_routes() output,
        e.g. [{"vehicle_id": 1, "stops_in_order": ["Z-102"], "total_distance_km": 5.84}, ...]

    team_names: maps vehicle_id -> a human-readable team name, e.g.
        {1: "Team Alpha", 2: "Team Bravo"}

    Returns: list of created mission records.
    """
    global _next_mission_id
    created = []

    for route in routes:
        if not route["stops_in_order"]:
            continue  # skip empty routes, no mission needed

        vehicle_id = route["vehicle_id"]
        mission_id = f"M-{_next_mission_id:04d}"
        _next_mission_id += 1

        mission = {
            "mission_id": mission_id,
            "team_name": team_names.get(vehicle_id, f"Team {vehicle_id}"),
            "vehicle_id": vehicle_id,
            "zones": route["stops_in_order"],
            "total_distance_km": route["total_distance_km"],
            "status": "assigned",  # assigned -> in_progress -> completed
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        _missions_db[mission_id] = mission
        created.append(mission)

    return created


def update_mission_status(mission_id: str, new_status: str) -> dict:
    """
    new_status must be one of: "assigned", "in_progress", "completed"
    """
    valid_statuses = {"assigned", "in_progress", "completed"}
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of {valid_statuses}")

    if mission_id not in _missions_db:
        raise KeyError(f"No mission found with id {mission_id}")

    _missions_db[mission_id]["status"] = new_status
    _missions_db[mission_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
    return _missions_db[mission_id]


def get_all_missions() -> list[dict]:
    return list(_missions_db.values())


def get_mission(mission_id: str) -> dict:
    if mission_id not in _missions_db:
        raise KeyError(f"No mission found with id {mission_id}")
    return _missions_db[mission_id]


# ---------------------------------------------------------
# Quick test - run this file directly to see it in action
# ---------------------------------------------------------
if __name__ == "__main__":
    sample_routes = [
        {"vehicle_id": 1, "stops_in_order": ["Z-102"], "total_distance_km": 5.84},
        {"vehicle_id": 2, "stops_in_order": ["Z-101"], "total_distance_km": 12.48},
    ]
    sample_teams = {1: "Team Alpha", 2: "Team Bravo"}

    import json

    missions = create_missions(sample_routes, sample_teams)
    print("Created missions:")
    print(json.dumps(missions, indent=2))

    # Simulate updating a mission's status
    updated = update_mission_status(missions[0]["mission_id"], "in_progress")
    print("\nAfter status update:")
    print(json.dumps(updated, indent=2))
