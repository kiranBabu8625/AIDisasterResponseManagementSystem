"""
Milestone 3 - Stage 1: Resource Allocation API

FastAPI endpoint wrapping allocation_engine.py.
Follows the same structure as prediction_api.py from Milestone 2.

Run with:
    uvicorn allocation_api:app --reload --port 8001
"""

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.allocation_engine import allocate_resources


app = FastAPI(title="Disaster Response - Resource Allocation API")


# ---------- Request/Response Schemas ----------

class ZoneDemand(BaseModel):
    zone_id: str
    severity_weight: float  # 0-1, from Milestone 2's vulnerability_score
    food_packets: float
    water_liters: float
    medical_kits: float
    shelter_capacity: float


class AllocationRequest(BaseModel):
    zones: List[ZoneDemand]
    available_resources: Dict[str, float]


# ---------- Endpoint ----------

@app.post("/allocate-resources")
def allocate(request: AllocationRequest):
    """
    Takes zone demand (usually straight from /predict-demand output
    in Milestone 2) + total available resources, returns the optimal
    per-zone allocation.
    """
    zones_as_dicts = [zone.model_dump() for zone in request.zones]

    try:
        result = allocate_resources(zones_as_dicts, request.available_resources)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return result


@app.get("/")
def root():
    return {"status": "Resource Allocation API is running"}
