"""
Scenario Simulation Router
====================================================
Exposes Milestone 2's dormant scenario_simulation.py logic as a real
API endpoint. Lets a coordinator ask "what if" questions about a
zone's predicted demand: what if response is delayed, or what if
only a percentage of required supplies are available.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

# scenario_simulation.py lives at the project root, not inside app/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scenario_simulation import simulate_delay, simulate_supply_shortage

router = APIRouter(prefix="/scenario", tags=["Scenario Simulation"])


class ScenarioRequest(BaseModel):
    predictions: dict  # e.g. {"food": 1417, "water": 6704, "medical": 204, "shelter": 989}
    delay_days: Optional[int] = None
    available_percent: Optional[float] = None


@router.post("/simulate")
def simulate(request: ScenarioRequest):
    """
    Runs one or both scenario simulations on a given set of predicted
    demand numbers (usually taken straight from /predict/demand/{zone_id}).
    """
    if request.delay_days is None and request.available_percent is None:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one of delay_days or available_percent"
        )

    result = {}

    if request.delay_days is not None:
        result["delay_scenario"] = {
            "delay_days": request.delay_days,
            "updated_predictions": simulate_delay(request.predictions, request.delay_days),
        }

    if request.available_percent is not None:
        result["shortage_scenario"] = {
            "available_percent": request.available_percent,
            "breakdown": simulate_supply_shortage(request.predictions, request.available_percent),
        }

    return result
