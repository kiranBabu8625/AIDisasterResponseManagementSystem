import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ==============================
# 1. Load Dataset
# ==============================

DATA_PATH = "data/milestone2_disaster_response_dataset_5000.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ==============================
# 2. Select Input Features
# ==============================

features = [
    "population",
    "damage_percent",
    "severity_score",
    "elderly_percent",
    "children_percent",
    "medically_dependent_percent",
    "affected_population"
]

targets = [
    "food_needed_packets",
    "water_needed_liters",
    "medical_kits_needed",
    "shelter_spaces_needed"
]


X = df[features]


# ==============================
# 3. Create Models Folder
# ==============================

os.makedirs("models", exist_ok=True)


# ==============================
# 4. Train One Model for Each
#    Resource Type
# ==============================

for target in targets:

    print("\n==============================")
    print("Training:", target)
    print("==============================")

    y = df[target]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42
    )

    # Create Random Forest model
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    # Train model
    model.fit(X_train, y_train)

    # Make predictions
    predictions = model.predict(X_test)

    # Calculate MAE
    mae = mean_absolute_error(y_test, predictions)

    # Calculate RMSE
    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    print("MAE :", round(mae, 2))
    print("RMSE:", round(rmse, 2))

    # Save model
    model_path = f"models/{target}_model.pkl"

    joblib.dump(model, model_path)

    print("Model saved:", model_path)


print("\n================================")
print("All models trained successfully!")
print("================================")