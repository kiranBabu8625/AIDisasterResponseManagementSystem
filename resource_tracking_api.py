"""
Milestone 3 - Stage 5: Resource Tracking API
================================================
FastAPI endpoint wrapping resource_tracking.py.

Run with: uvicorn resource_tracking_api:app --reload --port 8006
"""

from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.resource_tracking import (
    get_all_zone_statuses,
    get_delivery_log,
    get_zone_status,
    log_delivery,
    register_allocation,
)


app = FastAPI(title="Disaster Response - Resource Tracking API")


# ---------- Request/Response Schemas ----------

class RegisterAllocationRequest(BaseModel):
    zone_id: str
    allocated: Dict[str, float]  # e.g. {"food_packets": 5200, ...}


class LogDeliveryRequest(BaseModel):
    zone_id: str
    resource: str
    amount: float
    mission_id: Optional[str] = None


# ---------- Endpoints ----------

@app.post("/register-allocation")
def register(request: RegisterAllocationRequest):
    """
    Call this once per zone right after Stage 1 (Resource Allocation)
    finishes, so the tracker knows what each zone is SUPPOSED to get.
    """
    register_allocation(request.zone_id, request.allocated)
    return {"status": "registered", "zone_id": request.zone_id}


@app.post("/log-delivery")
def deliver(request: LogDeliveryRequest):
    """Record that a real delivery happened (call this when a team confirms drop-off)."""
    try:
        entry = log_delivery(
            request.zone_id, request.resource, request.amount, request.mission_id
        )
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return entry


@app.get("/zones/{zone_id}/status")
def zone_status(zone_id: str):
    """Get delivered vs. allocated status for one zone."""
    try:
        return get_zone_status(zone_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/zones/status")
def all_zone_statuses():
    """Get delivered vs. allocated status for ALL zones - feeds the dashboard."""
    return {"zones": get_all_zone_statuses()}


@app.get("/delivery-log")
def delivery_log(zone_id: Optional[str] = None):
    """Full raw delivery history, optionally filtered by zone."""
    return {"log": get_delivery_log(zone_id)}


@app.get("/")
def root():
    return {"status": "Resource Tracking API is running"}
