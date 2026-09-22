"""
Milestone 3 - Stage 5: Resource Tracking Engine
====================================================
Logs actual deliveries as they happen (e.g. a team confirms "we
delivered 500 food packets to Z-102") and tracks, per zone, how
much of the ALLOCATED amount has actually been delivered so far.

This is the final piece that feeds the live Operations Dashboard.
"""

from datetime import datetime, timezone

# In-memory stores - replace with real DB tables later (same pattern
# as mission_assignment.py). Keeping this simple on purpose.
_delivery_log: list[dict] = []
_zone_allocated: dict[str, dict] = {}   # zone_id -> {resource: allocated_amount}
_zone_delivered: dict[str, dict] = {}   # zone_id -> {resource: delivered_so_far}


def register_allocation(zone_id: str, allocated: dict) -> None:
    """
    Call this once per zone after Stage 1 (Resource Allocation) runs,
    to tell the tracker how much each zone is SUPPOSED to receive.

    allocated: e.g. {"food_packets": 5200, "water_liters": 8400, ...}
    """
    _zone_allocated[zone_id] = dict(allocated)
    if zone_id not in _zone_delivered:
        _zone_delivered[zone_id] = {resource: 0 for resource in allocated}


def log_delivery(zone_id: str, resource: str, amount: float, mission_id: str = None) -> dict:
    """
    Record that a real delivery happened. Call this whenever a team
    confirms they dropped off supplies.
    """
    if zone_id not in _zone_allocated:
        raise KeyError(f"Zone {zone_id} has no registered allocation yet")
    if resource not in _zone_allocated[zone_id]:
        raise KeyError(f"Resource '{resource}' was not allocated to zone {zone_id}")

    _zone_delivered.setdefault(zone_id, {}).setdefault(resource, 0)
    _zone_delivered[zone_id][resource] += amount

    entry = {
        "zone_id": zone_id,
        "resource": resource,
        "amount": amount,
        "mission_id": mission_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _delivery_log.append(entry)
    return entry


def get_zone_status(zone_id: str) -> dict:
    """
    Returns, per resource: allocated amount, delivered so far,
    remaining, and % complete.
    """
    if zone_id not in _zone_allocated:
        raise KeyError(f"Zone {zone_id} has no registered allocation yet")

    allocated = _zone_allocated[zone_id]
    delivered = _zone_delivered.get(zone_id, {})

    status = {}
    for resource, alloc_amt in allocated.items():
        delivered_amt = delivered.get(resource, 0)
        remaining = max(alloc_amt - delivered_amt, 0)
        pct_complete = round((delivered_amt / alloc_amt) * 100, 1) if alloc_amt > 0 else 100.0
        status[resource] = {
            "allocated": alloc_amt,
            "delivered": delivered_amt,
            "remaining": remaining,
            "pct_complete": pct_complete,
        }

    return {"zone_id": zone_id, "resources": status}


def get_all_zone_statuses() -> list[dict]:
    return [get_zone_status(zone_id) for zone_id in _zone_allocated]


def get_delivery_log(zone_id: str = None) -> list[dict]:
    if zone_id is None:
        return _delivery_log
    return [entry for entry in _delivery_log if entry["zone_id"] == zone_id]


# ---------------------------------------------------------
# Quick test - run this file directly to see it in action
# ---------------------------------------------------------
if __name__ == "__main__":
    import json

    # Step 1: register what was allocated (comes from Stage 1's output)
    register_allocation("Z-102", {"food_packets": 3100, "water_liters": 5200, "medical_kits": 320})

    # Step 2: log some real deliveries as they happen
    log_delivery("Z-102", "food_packets", 1500, mission_id="M-0001")
    log_delivery("Z-102", "food_packets", 1600, mission_id="M-0001")
    log_delivery("Z-102", "water_liters", 2000, mission_id="M-0001")

    # Step 3: check status
    print(json.dumps(get_zone_status("Z-102"), indent=2))
