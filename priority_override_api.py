"""
Milestone 3 - Stage 3: Priority Override API
================================================
FastAPI endpoint wrapping priority_override.py.

Run with: uvicorn priority_override_api:app --reload --port 8004
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.priority_override import apply_priority_override


app = FastAPI(title="Disaster Response - Priority Override API")


# ---------- Request/Response Schemas ----------

class ZoneFull(BaseModel):
    zone_id: str
    severity_weight: float
    food_packets: float
    water_liters: float
    medical_kits: float
    shelter_capacity: float
    latitude: float
    longitude: float


class Depot(BaseModel):
    name: str
    latitude: float
    longitude: float


class Override(BaseModel):
    zone_id: str
    new_severity_weight: float
    reason: Optional[str] = None


class OverrideRequest(BaseModel):
    zones: List[ZoneFull]
    available_resources: dict
    depot: Depot
    num_vehicles: int
    overrides: List[Override]


# ---------- Endpoint ----------

@app.post("/override-priority")
def override_priority(request: OverrideRequest):
    """
    Coordinator manually overrides one or more zones' severity weight
    (e.g. a new field report changes the picture). Re-runs allocation
    and routing immediately using the updated priorities.
    """
    zones_as_dicts = [zone.model_dump() for zone in request.zones]
    overrides_as_dicts = [override.model_dump() for override in request.overrides]
    depot_as_dict = request.depot.model_dump()

    try:
        result = apply_priority_override(
            zones_as_dicts,
            request.available_resources,
            depot_as_dict,
            request.num_vehicles,
            overrides_as_dicts,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return result


@app.get("/")
def root():
    return {"status": "Priority Override API is running"}
