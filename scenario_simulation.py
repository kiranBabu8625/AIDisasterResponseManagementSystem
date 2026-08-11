def simulate_delay(predictions, delay_days):
    """
    Simulate how a delay in relief response
    increases resource demand.
    """

    # Increase demand by 5% for each delay day
    increase_factor = 1 + (delay_days * 0.05)

    updated_predictions = {}

    for resource, amount in predictions.items():
        updated_predictions[resource] = round(
            amount * increase_factor,
            2
        )

    return updated_predictions


def simulate_supply_shortage(predictions, available_percent):
    """
    Simulate a situation where only a percentage
    of the required supplies are available.
    """

    available_factor = available_percent / 100

    result = {}

    for resource, required in predictions.items():

        available = round(
            required * available_factor,
            2
        )

        shortage = round(
            required - available,
            2
        )

        result[resource] = {
            "required": required,
            "available": available,
            "shortage": shortage
        }

    return result