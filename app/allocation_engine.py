"""
Milestone 3 - Stage 1: Resource Allocation Engine
====================================================
Takes per-zone demand predictions (from Milestone 2) + total available
resources, and computes the OPTIMAL split across zones using Linear
Programming (Google OR-Tools).

Objective: Maximize total (severity-weighted) demand satisfied,
           without exceeding available supply.
"""

from ortools.linear_solver import pywraplp


def allocate_resources(zones: list[dict], available_resources: dict) -> dict:
    """
    zones: list of dicts, each like:
        {
            "zone_id": "Z-101",
            "severity_weight": 0.9,   # 0-1, higher = more urgent (from Milestone 2 vulnerability score)
            "food_packets": 5200,     # predicted demand
            "water_liters": 8400,
            "medical_kits": 560,
            "shelter_capacity": 1100,
        }

    available_resources: dict like:
        {
            "food_packets": 12000,
            "water_liters": 20000,
            "medical_kits": 1500,
            "shelter_capacity": 3000,
        }

    Returns: dict with per-zone allocation + fulfillment percentage.
    """

    solver = pywraplp.Solver.CreateSolver("GLOP")  # GLOP = linear solver (fast, continuous)
    if not solver:
        raise RuntimeError("Could not create OR-Tools solver")

    resource_types = list(available_resources.keys())

    # 1. DECISION VARIABLES
    # allocation[zone_id][resource] = how much of that resource this zone gets
    allocation_vars = {}
    for zone in zones:
        zid = zone["zone_id"]
        allocation_vars[zid] = {}
        for res in resource_types:
            demand = zone[res]
            # Each allocation is between 0 and the zone's actual demand
            # (never allocate MORE than what's needed)
            allocation_vars[zid][res] = solver.NumVar(0, demand, f"{zid}_{res}")

    # 2. CONSTRAINTS
    # Total allocated of each resource type cannot exceed what's available
    for res in resource_types:
        solver.Add(
            solver.Sum(allocation_vars[zid][res] for zid in allocation_vars)
            <= available_resources[res]
        )

    # 3. OBJECTIVE
    # Maximize total demand satisfied, weighted by severity
    # (a unit of food sent to a high-severity zone counts for more)
    objective_terms = []
    for zone in zones:
        zid = zone["zone_id"]
        weight = zone.get("severity_weight", 0.5)
        for res in resource_types:
            objective_terms.append(weight * allocation_vars[zid][res])

    solver.Maximize(solver.Sum(objective_terms))

    # 4. SOLVE
    status = solver.Solve()

    if status != pywraplp.Solver.OPTIMAL:
        raise RuntimeError("No optimal solution found - check your constraints/data")

    # 5. BUILD RESULT
    result = {"zones": [], "solver_status": "OPTIMAL"}
    for zone in zones:
        zid = zone["zone_id"]
        zone_result = {"zone_id": zid, "allocated": {}, "fulfillment_pct": {}}
        for res in resource_types:
            allocated_amt = allocation_vars[zid][res].solution_value()
            demand = zone[res]
            fulfillment = round((allocated_amt / demand) * 100, 1) if demand > 0 else 100.0
            zone_result["allocated"][res] = round(allocated_amt, 1)
            zone_result["fulfillment_pct"][res] = fulfillment
        result["zones"].append(zone_result)

    return result


# ---------------------------------------------------------
# Quick test - run this file directly to see it in action
# ---------------------------------------------------------
if __name__ == "__main__":
    sample_zones = [
        {"zone_id": "Z-101", "severity_weight": 0.9, "food_packets": 5200,
         "water_liters": 8400, "medical_kits": 560, "shelter_capacity": 1100},
        {"zone_id": "Z-102", "severity_weight": 0.5, "food_packets": 3100,
         "water_liters": 5200, "medical_kits": 320, "shelter_capacity": 700},
        {"zone_id": "Z-103", "severity_weight": 0.95, "food_packets": 7300, "water_liters": 11600,
         "medical_kits": 820, "shelter_capacity": 1500},
    ]

    # Deliberately LESS than total demand, to show the LP make trade-offs
    sample_available = {
        "food_packets": 10000,
        "water_liters": 18000,
        "medical_kits": 1200,
        "shelter_capacity": 2500,
    }

    import json

    output = allocate_resources(sample_zones, sample_available)
    print(json.dumps(output, indent=2))
