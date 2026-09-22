"""
Milestone 3 - Stage 4: Mission Assignment API
================================================
FastAPI endpoint wrapping mission_assignment.py.

Run with: uvicorn mission_assignment_api:app --reload --port 8005
"""

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.mission_assignment import (
    create_missions,
    get_all_missions,
    get_mission,
    update_mission_status,
)


app = FastAPI(title="Disaster Response - Mission Assignment API")


# ---------- Request/Response Schemas ----------

class Route(BaseModel):
    vehicle_id: int
    stops_in_order: List[str]
    total_distance_km: float


class CreateMissionsRequest(BaseModel):
    routes: List[Route]
    team_names: Dict[int, str]  # e.g. {1: "Team Alpha", 2: "Team Bravo"}


class StatusUpdateRequest(BaseModel):
    new_status: str  # "assigned" | "in_progress" | "completed"


# ---------- Endpoints ----------

@app.post("/create-missions")
def create(request: CreateMissionsRequest):
    """
    Takes the routes from Stage 2 (or Stage 3's updated_routes) and
    creates a mission record per non-empty route, assigning it to a
    named team.
    """
    routes_as_dicts = [route.model_dump() for route in request.routes]
    missions = create_missions(routes_as_dicts, request.team_names)
    return {"missions_created": missions}


@app.patch("/missions/{mission_id}/status")
def update_status(mission_id: str, request: StatusUpdateRequest):
    """Update a mission's status: assigned -> in_progress -> completed."""
    try:
        updated = update_mission_status(mission_id, request.new_status)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return updated


@app.get("/missions")
def list_missions():
    """List every mission created so far."""
    return {"missions": get_all_missions()}


@app.get("/missions/{mission_id}")
def get_one_mission(mission_id: str):
    try:
        return get_mission(mission_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/")
def root():
    return {"status": "Mission Assignment API is running"}
