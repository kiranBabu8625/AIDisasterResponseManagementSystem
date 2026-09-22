"""
Milestone 3 - Stage 3: Priority Override Engine
====================================================
Lets a human coordinator manually override a zone's severity/priority
(e.g. a new field report says a zone is worse than the AI predicted),
then re-runs Stage 1 (Allocation) and Stage 2 (Routing) using the
updated priority.

This module doesn't invent new math - it reuses allocation_engine.py
and routing_engine.py, and just changes the INPUT before re-solving.
"""

from app.allocation_engine import allocate_resources
from app.routing_engine import plan_routes


def apply_priority_override(
    zones: list[dict],
    available_resources: dict,
    depot: dict,
    num_vehicles: int,
    overrides: list[dict],
) -> dict:
    """
    zones: the SAME zone list used in Stage 1 (each has zone_id,
        severity_weight, food_packets, water_liters, medical_kits,
        shelter_capacity) - should also include latitude/longitude
        for routing to work.

    overrides: list of dicts like:
        [{"zone_id": "Z-102", "new_severity_weight": 0.95,
          "reason": "New field report: casualties higher than expected"}]

    Returns: updated allocation + updated routes, plus a log of
        what was overridden and why.
    """

    override_map = {override["zone_id"]: override for override in overrides}
    override_log = []

    # 1. Apply the override: update severity_weight for the flagged zones
    updated_zones = []
    for zone in zones:
        zone_copy = dict(zone)  # don't mutate the original input
        zone_id = zone_copy["zone_id"]
        if zone_id in override_map:
            old_weight = zone_copy.get("severity_weight", 0.5)
            new_weight = override_map[zone_id]["new_severity_weight"]
            zone_copy["severity_weight"] = new_weight
            override_log.append({
                "zone_id": zone_id,
                "old_severity_weight": old_weight,
                "new_severity_weight": new_weight,
                "reason": override_map[zone_id].get("reason", "Not specified"),
            })
        updated_zones.append(zone_copy)

    # 2. Re-run Stage 1: Resource Allocation with updated priorities
    allocation_result = allocate_resources(updated_zones, available_resources)

    # 3. Re-run Stage 2: Logistics Routing (uses the same zone locations -
    #    routing only cares about WHERE zones are, not their severity, but
    #    we re-run it here since a real override might also add/remove
    #    zones needing delivery)
    routing_zones = [
        {"zone_id": zone["zone_id"], "latitude": zone["latitude"], "longitude": zone["longitude"]}
        for zone in updated_zones
    ]
    routing_result = plan_routes(depot, routing_zones, num_vehicles)

    return {
        "override_log": override_log,
        "updated_allocation": allocation_result,
        "updated_routes": routing_result,
    }


# ---------------------------------------------------------
# Quick test - run this file directly to see it in action
# ---------------------------------------------------------
if __name__ == "__main__":
    sample_zones = [
        {"zone_id": "Z-101", "severity_weight": 0.9, "food_packets": 5200,
         "water_liters": 8400, "medical_kits": 560, "shelter_capacity": 1100,
         "latitude": 17.4400, "longitude": 78.4983},
        {"zone_id": "Z-102", "severity_weight": 0.5, "food_packets": 3100,
         "water_liters": 5200, "medical_kits": 320, "shelter_capacity": 700,
         "latitude": 17.3616, "longitude": 78.4747},
    ]

    sample_available = {
        "food_packets": 6000, "water_liters": 10000,
        "medical_kits": 700, "shelter_capacity": 1500,
    }

    sample_depot = {"name": "Central Warehouse", "latitude": 17.3850, "longitude": 78.4867}

    sample_overrides = [
        {"zone_id": "Z-102", "new_severity_weight": 0.95,
         "reason": "New field report: casualties higher than expected"}
    ]

    import json

    output = apply_priority_override(
        sample_zones, sample_available, sample_depot, 2, sample_overrides
    )
    print(json.dumps(output, indent=2))
