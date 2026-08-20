from recalibration import (
    save_prediction_history,
    recalibrate_prediction,
    get_prediction_history
)


# Initial prediction
initial_predictions = {
    "food": 1000,
    "water": 5000,
    "medical": 200,
    "shelter": 800
}

print("Initial Predictions:")
print(initial_predictions)


# New field report:
# Damage increased by 20%
updated_predictions = recalibrate_prediction(
    initial_predictions,
    damage_change_percent=20
)

print("\nUpdated Predictions:")
print(updated_predictions)


# Save updated prediction
save_prediction_history(
    "Z0001",
    updated_predictions
)


# Display prediction history
history = get_prediction_history()

print("\nPrediction History:")
print(history)