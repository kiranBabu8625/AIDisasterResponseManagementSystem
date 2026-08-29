"""
Milestone 3 - Stage 2: Logistics Routing API
================================================
FastAPI endpoint wrapping routing_engine.py.

Run with: uvicorn routing_api:app --reload --port 8002
"""

from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.routing_engine import plan_routes


app = FastAPI(title="Disaster Response - Logistics Routing API")


# ---------- Request/Response Schemas ----------

class Depot(BaseModel):
    name: str
    latitude: float
    longitude: float


class ZoneLocation(BaseModel):
    zone_id: str
    latitude: float
    longitude: float


class RoutingRequest(BaseModel):
    depot: Depot
    zones: List[ZoneLocation]
    num_vehicles: int


# ---------- Endpoint ----------

@app.post("/plan-routes")
def routes(request: RoutingRequest):
    """
    Takes a depot location, a list of zones (usually the zones that
    received an allocation in Stage 1), and how many vehicles are
    available. Returns the optimal set of delivery routes.
    """
    zones_as_dicts = [zone.model_dump() for zone in request.zones]
    depot_as_dict = request.depot.model_dump()

    try:
        result = plan_routes(depot_as_dict, zones_as_dicts, request.num_vehicles)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return result


@app.get("/")
def root():
    return {"status": "Logistics Routing API is running"}
