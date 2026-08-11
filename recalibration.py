import json
import os
from datetime import datetime


HISTORY_FILE = "prediction_history.json"


def save_prediction_history(zone_id, predictions):
    """
    Save a new prediction to the prediction history.
    """

    history = []

    # Load existing history
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as file:
            history = json.load(file)

    # Create new record
    record = {
        "zone_id": zone_id,
        "timestamp": datetime.now().isoformat(),
        "predictions": predictions
    }

    history.append(record)

    # Save updated history
    with open(HISTORY_FILE, "w") as file:
        json.dump(history, file, indent=4)

    print("Prediction history saved successfully!")


def recalibrate_prediction(
    current_predictions,
    damage_change_percent=0
):
    """
    Recalculate predictions when new disaster information arrives.
    """

    adjustment = 1 + (damage_change_percent / 100)

    updated_predictions = {}

    for resource, prediction in current_predictions.items():
        updated_predictions[resource] = round(
            prediction * adjustment,
            2
        )

    return updated_predictions


def get_prediction_history():
    """
    Return all previously stored predictions.
    """

    if not os.path.exists(HISTORY_FILE):
        return []

    with open(HISTORY_FILE, "r") as file:
        return json.load(file)