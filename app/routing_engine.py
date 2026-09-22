"""
Milestone 3 - Stage 2: Logistics Routing Engine
====================================================
Takes zone locations (from PostGIS) + a depot location + number of
available vehicles, and computes efficient delivery routes using
Google OR-Tools' Vehicle Routing Problem (VRP) solver.

Goal: Minimize total distance traveled while making sure every
zone that needs a delivery gets visited by exactly one vehicle.
"""

import math

from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


def compute_distance_matrix(locations: list[dict]) -> list[list[int]]:
    """
    locations: list of dicts like {"latitude": 17.38, "longitude": 78.48}
    Index 0 is always the depot; the rest are zones.

    Returns a matrix of straight-line distances (in meters, rounded to int
    since OR-Tools' routing solver requires integer distances).
    """
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            lat1, lon1 = locations[i]["latitude"], locations[i]["longitude"]
            lat2, lon2 = locations[j]["latitude"], locations[j]["longitude"]
            # Simple approximation: 1 degree ~ 111km. Good enough for routing
            # order (not for real-world exact distance - swap in a real
            # roads API like OSRM/Google Distance Matrix later if needed).
            dist_km = math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) * 111
            matrix[i][j] = int(dist_km * 1000)  # convert to meters

    return matrix


def plan_routes(depot: dict, zones: list[dict], num_vehicles: int) -> dict:
    """
    depot: {"name": "Main Warehouse", "latitude": ..., "longitude": ...}
    zones: list of {"zone_id": "Z-101", "latitude": ..., "longitude": ...}
    num_vehicles: how many trucks/teams are available

    Returns: dict mapping each vehicle to its ordered list of zone stops.
    """

    # Index 0 = depot, indices 1..N = zones (this ordering matters throughout)
    all_locations = [depot] + zones
    distance_matrix = compute_distance_matrix(all_locations)

    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix), num_vehicles, 0  # 0 = depot index
    )
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add a distance "dimension" and penalize the max route length across
    # vehicles. This discourages the solver from dumping all stops on one
    # vehicle and leaving others empty (span cost balances the workload).
    dimension_name = "Distance"
    routing.AddDimension(
        transit_callback_index,
        0,          # no slack
        3_000_000,  # generous max distance per vehicle (meters)
        True,       # start cumul at zero
        dimension_name,
    )
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        raise RuntimeError("No routing solution found - check vehicle count/locations")

    # Build readable result: vehicle -> ordered list of zone_ids it visits
    result = {"routes": [], "depot": depot.get("name", "Depot")}
    for vehicle_id in range(num_vehicles):
        index = routing.Start(vehicle_id)
        route_stops = []
        route_distance = 0
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != 0:  # skip depot in the stop list
                route_stops.append(zones[node - 1]["zone_id"])
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id
            )

        result["routes"].append({
            "vehicle_id": vehicle_id + 1,
            "stops_in_order": route_stops,
            "total_distance_km": round(route_distance / 1000, 2),
        })

    return result


# ---------------------------------------------------------
# Quick test - run this file directly to see it in action
# ---------------------------------------------------------
if __name__ == "__main__":
    sample_depot = {"name": "Central Warehouse", "latitude": 17.3850, "longitude": 78.4867}

    sample_zones = [
        {"zone_id": "Z-101", "latitude": 17.4400, "longitude": 78.4983},
        {"zone_id": "Z-102", "latitude": 17.3616, "longitude": 78.4747},
        {"zone_id": "Z-103", "latitude": 17.4239, "longitude": 78.4738},
        {"zone_id": "Z-104", "latitude": 17.3300, "longitude": 78.5500},
    ]

    import json

    output = plan_routes(sample_depot, sample_zones, num_vehicles=2)
    print(json.dumps(output, indent=2))
