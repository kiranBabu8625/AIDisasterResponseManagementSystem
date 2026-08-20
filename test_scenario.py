from scenario_simulation import (
    simulate_delay,
    simulate_supply_shortage
)


# Normal predicted demand
predictions = {
    "food": 1000,
    "water": 5000,
    "medical": 200,
    "shelter": 800
}


# ==============================
# Scenario 1: 3-Day Delay
# ==============================

delay_result = simulate_delay(
    predictions,
    delay_days=3
)

print("=== 3-Day Delay Scenario ===")
print(delay_result)


# ==============================
# Scenario 2: Only 60% Supplies
# ==============================

shortage_result = simulate_supply_shortage(
    predictions,
    available_percent=60
)

print("\n=== 60% Supply Availability Scenario ===")

for resource, values in shortage_result.items():
    print(
        resource,
        "-> Required:",
        values["required"],
        "| Available:",
        values["available"],
        "| Shortage:",
        values["shortage"]
    )