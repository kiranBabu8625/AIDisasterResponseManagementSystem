"""
Milestone 3 - Combined API
====================================================
Merges all 5 Stage APIs (Allocation, Routing, Priority Override,
Mission Assignment, Resource Tracking) into ONE FastAPI app, using
routers. Same logic as before - just organized under one server.

Run with: uvicorn milestone3_api:app --reload --port 8000
Then visit: http://127.0.0.1:8000/docs  (you'll see ALL endpoints together)
"""

from typing import Dict, List, Optional

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.allocation_engine import allocate_resources
from app.mission_assignment import (
    create_missions,
    get_all_missions,
    get_mission,
    update_mission_status,
)
from app.priority_override import apply_priority_override
from app.resource_tracking import (
    get_all_zone_statuses,
    get_delivery_log,
    get_zone_status,
    log_delivery,
    register_allocation,
)
from app.zones_router import router as zones_router
from app.scenario_router import router as scenario_router
from app.routing_engine import plan_routes


app = FastAPI(title="Disaster Response - Milestone 3 Combined API")

# Allow your React frontend (running on a different port, e.g. 5173 or 3000)
# to call this API. Without this, the browser blocks the requests (CORS error).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. Restrict this before deploying for real.
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STAGE 1: Resource Allocation
# ============================================================
allocation_router = APIRouter(prefix="/allocation", tags=["Stage 1: Allocation"])


class ZoneDemand(BaseModel):
    zone_id: str
    severity_weight: float
    food_packets: float
    water_liters: float
    medical_kits: float
    shelter_capacity: float


class AllocationRequest(BaseModel):
    zones: List[ZoneDemand]
    available_resources: Dict[str, float]


@allocation_router.post("/allocate-resources")
def allocate(request: AllocationRequest):
    try:
        return allocate_resources(
            [zone.model_dump() for zone in request.zones],
            request.available_resources,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


# ============================================================
# STAGE 2: Logistics Routing
# ============================================================
routing_router = APIRouter(prefix="/routing", tags=["Stage 2: Routing"])


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


@routing_router.post("/plan-routes")
def routes(request: RoutingRequest):
    try:
        return plan_routes(
            request.depot.model_dump(),
            [zone.model_dump() for zone in request.zones],
            request.num_vehicles,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


# ============================================================
# STAGE 3: Priority Override
# ============================================================
override_router = APIRouter(prefix="/override", tags=["Stage 3: Priority Override"])


class ZoneFull(BaseModel):
    zone_id: str
    severity_weight: float
    food_packets: float
    water_liters: float
    medical_kits: float
    shelter_capacity: float
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


@override_router.post("/override-priority")
def override_priority(request: OverrideRequest):
    try:
        return apply_priority_override(
            [zone.model_dump() for zone in request.zones],
            request.available_resources,
            request.depot.model_dump(),
            request.num_vehicles,
            [override.model_dump() for override in request.overrides],
        )
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


# ============================================================
# STAGE 4: Mission Assignment
# ============================================================
mission_router = APIRouter(prefix="/missions", tags=["Stage 4: Mission Assignment"])


class Route(BaseModel):
    vehicle_id: int
    stops_in_order: List[str]
    total_distance_km: float


class CreateMissionsRequest(BaseModel):
    routes: List[Route]
    team_names: Dict[int, str]


class StatusUpdateRequest(BaseModel):
    new_status: str


@mission_router.post("/create-missions")
def create(request: CreateMissionsRequest):
    return {
        "missions_created": create_missions(
            [route.model_dump() for route in request.routes],
            request.team_names,
        )
    }


@mission_router.patch("/{mission_id}/status")
def update_status(mission_id: str, request: StatusUpdateRequest):
    try:
        return update_mission_status(mission_id, request.new_status)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@mission_router.get("")
def list_missions():
    return {"missions": get_all_missions()}


@mission_router.get("/{mission_id}")
def get_one_mission(mission_id: str):
    try:
        return get_mission(mission_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


# ============================================================
# STAGE 5: Resource Tracking
# ============================================================
tracking_router = APIRouter(prefix="/tracking", tags=["Stage 5: Resource Tracking"])


class RegisterAllocationRequest(BaseModel):
    zone_id: str
    allocated: Dict[str, float]


class LogDeliveryRequest(BaseModel):
    zone_id: str
    resource: str
    amount: float
    mission_id: Optional[str] = None


@tracking_router.post("/register-allocation")
def register(request: RegisterAllocationRequest):
    register_allocation(request.zone_id, request.allocated)
    return {"status": "registered", "zone_id": request.zone_id}


@tracking_router.post("/log-delivery")
def deliver(request: LogDeliveryRequest):
    try:
        return log_delivery(
            request.zone_id,
            request.resource,
            request.amount,
            request.mission_id,
        )
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@tracking_router.get("/zones/{zone_id}/status")
def zone_status(zone_id: str):
    try:
        return get_zone_status(zone_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@tracking_router.get("/zones/status")
def all_zone_statuses():
    return {"zones": get_all_zone_statuses()}


@tracking_router.get("/delivery-log")
def delivery_log(zone_id: Optional[str] = None):
    return {"log": get_delivery_log(zone_id)}


# ============================================================
# Mount all routers onto the main app
# ============================================================
app.include_router(allocation_router)
app.include_router(routing_router)
app.include_router(override_router)
app.include_router(mission_router)
app.include_router(tracking_router)
app.include_router(zones_router)
app.include_router(scenario_router)


@app.get("/")
def root():
    return {"status": "Milestone 3 Combined API is running", "stages": 5}
