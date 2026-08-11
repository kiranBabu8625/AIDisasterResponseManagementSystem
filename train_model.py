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


# ==============================
# 2. Feature Engineering
# ==============================

# Percentage of population affected
df["affected_population_percent"] = (
    df["affected_population"] / df["population"]
) * 100

# Combined vulnerability score
df["vulnerability_score"] = (
    df["elderly_percent"]
    + df["children_percent"]
    + df["medically_dependent_percent"]
)

# Disaster impact score
df["impact_score"] = (
    df["damage_percent"] * df["severity_score"]
) / 100

# Vulnerability-adjusted impact
df["vulnerability_impact"] = (
    df["impact_score"] * (1 + df["vulnerability_score"] / 100)
)


# ==============================
# 3. Features
# ==============================

features = [
    "population",
    "damage_percent",
    "severity_score",
    "elderly_percent",
    "children_percent",
    "medically_dependent_percent",
    "affected_population",
    "affected_population_percent",
    "vulnerability_score",
    "impact_score",
    "vulnerability_impact"
]


targets = [
    "food_needed_packets",
    "water_needed_liters",
    "medical_kits_needed",
    "shelter_spaces_needed"
]


X = df[features]


# ==============================
# 4. Create Models Folder
# ==============================

os.makedirs("models", exist_ok=True)


# ==============================
# 5. Train Improved Models
# ==============================

for target in targets:

    print("\n==============================")
    print("Training improved model:", target)
    print("==============================")

    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    print("Improved MAE :", round(mae, 2))
    print("Improved RMSE:", round(rmse, 2))

    model_path = f"models/{target}_improved_model.pkl"

    joblib.dump(model, model_path)

    print("Model saved:", model_path)


print("\n======================================")
print("All improved models trained successfully!")
print("======================================")