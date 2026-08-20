from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import numpy as np

from app.database import SessionLocal
from app.models import DisasterZone

from vulnerability import (
    calculate_vulnerability_factor,
    adjust_prediction
)


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="AI Disaster Response Management System",
    description="Predicts disaster resource demand for each zone.",
    version="1.0"
)


# ============================================================
# Load Dataset
# ============================================================

DATA_PATH = "data/milestone2_disaster_response_dataset_5000.csv"

df = pd.read_csv(DATA_PATH)


# ============================================================
# Feature Engineering
# ============================================================

df["affected_population_percent"] = (
    df["affected_population"] / df["population"]
) * 100


df["vulnerability_score"] = (
    0.35 * df["elderly_percent"]
    + 0.30 * df["children_percent"]
    + 0.45 * df["medically_dependent_percent"]
)


df["impact_score"] = (
    df["damage_percent"] * df["severity_score"]
) / 100


df["vulnerability_impact"] = (
    df["impact_score"]
    * (1 + df["vulnerability_score"] / 100)
)


# ============================================================
# Features Used by ML Models
# ============================================================

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


# ============================================================
# Load Trained ML Models
# ============================================================

models = {

    "food": joblib.load(
        "models/food_needed_packets_improved_model.pkl"
    ),

    "water": joblib.load(
        "models/water_needed_liters_improved_model.pkl"
    ),

    "medical": joblib.load(
        "models/medical_kits_needed_improved_model.pkl"
    ),

    "shelter": joblib.load(
        "models/shelter_spaces_needed_improved_model.pkl"
    )
}


# ============================================================
# Prediction + Confidence Interval
# ============================================================

def get_prediction_with_confidence(model, X):

    tree_predictions = np.array([
        tree.predict(X)[0]
        for tree in model.estimators_
    ])

    prediction = float(
        np.mean(tree_predictions)
    )

    lower = float(
        np.percentile(
            tree_predictions,
            2.5
        )
    )

    upper = float(
        np.percentile(
            tree_predictions,
            97.5
        )
    )

    return prediction, lower, upper


# ============================================================
# Health Check
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Disaster Response API is running"
    }


# ============================================================
# Normal Demand Prediction
# ============================================================

@app.post("/predict/demand/{zone_id}")
def predict_demand(zone_id: str):

    # --------------------------------------------------------
    # Step 1: Get zone from PostgreSQL
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        disaster_zone = (
            db.query(DisasterZone)
            .filter(
                DisasterZone.zone_id == zone_id
            )
            .first()
        )

    finally:

        db.close()


    if disaster_zone is None:

        raise HTTPException(
            status_code=404,
            detail=f"Zone {zone_id} not found"
        )


    # --------------------------------------------------------
    # Step 2: Get ML data
    # --------------------------------------------------------

    zone = df[
        df["zone_id"] == zone_id
    ].copy()


    if zone.empty:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Zone {zone_id} has no ML dataset record"
            )
        )


    # --------------------------------------------------------
    # Step 3: Use database severity
    # --------------------------------------------------------

    zone["severity_score"] = (
        disaster_zone.severity_score
    )


    # Recalculate impact

    zone["impact_score"] = (
        zone["damage_percent"]
        * zone["severity_score"]
    ) / 100


    zone["vulnerability_impact"] = (
        zone["impact_score"]
        * (
            1
            + zone["vulnerability_score"] / 100
        )
    )


    # --------------------------------------------------------
    # Step 4: Prepare ML features
    # --------------------------------------------------------

    X = zone[features]


    # --------------------------------------------------------
    # Step 5: Generate predictions
    # --------------------------------------------------------

    predictions = {}


    for resource, model in models.items():

        prediction, lower, upper = (
            get_prediction_with_confidence(
                model,
                X
            )
        )


        predictions[resource] = {

            "prediction": round(
                max(0, prediction),
                2
            ),

            "confidence_interval": {

                "lower": round(
                    max(0, lower),
                    2
                ),

                "upper": round(
                    max(0, upper),
                    2
                )
            }
        }


    # --------------------------------------------------------
    # Step 6: Vulnerability weighting
    # --------------------------------------------------------

    vulnerability_score = float(
        zone["vulnerability_score"].iloc[0]
    )


    vulnerability_factor = (
        calculate_vulnerability_factor(
            vulnerability_score
        )
    )


    adjusted_predictions = {}


    for resource, values in predictions.items():

        adjusted_prediction = adjust_prediction(
            values["prediction"],
            vulnerability_factor
        )


        adjusted_lower = adjust_prediction(
            values["confidence_interval"]["lower"],
            vulnerability_factor
        )


        adjusted_upper = adjust_prediction(
            values["confidence_interval"]["upper"],
            vulnerability_factor
        )


        adjusted_predictions[resource] = {

            "prediction": round(
                adjusted_prediction,
                2
            ),

            "confidence_interval": {

                "lower": round(
                    adjusted_lower,
                    2
                ),

                "upper": round(
                    adjusted_upper,
                    2
                )
            }
        }


    # --------------------------------------------------------
    # Step 7: Return response
    # --------------------------------------------------------

    return {

        "zone_id": zone_id,

        "grid_id": disaster_zone.grid_id,

        "disaster_type": (
            disaster_zone.disaster_type
        ),

        "severity_score": (
            disaster_zone.severity_score
        ),

        "severity_level": (
            disaster_zone.severity_level
        ),

        "geometry": {

            "latitude": float(
                disaster_zone.latitude
            ),

            "longitude": float(
                disaster_zone.longitude
            ),

            "radius_km": (
                disaster_zone.radius_km
            )
        },

        "vulnerability_score": round(
            vulnerability_score,
            2
        ),

        "vulnerability_factor": round(
            vulnerability_factor,
            2
        ),

        "predictions": adjusted_predictions
    }


# ============================================================
# Dynamic Demand Update Request
# ============================================================

class DemandUpdate(BaseModel):

    severity_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Updated disaster severity score"
    )

    damage_percent: float = Field(
        ...,
        ge=0,
        le=100,
        description="Updated damage percentage"
    )

    affected_population: int = Field(
        ...,
        ge=0,
        description="Updated affected population"
    )


# ============================================================
# Dynamic Demand Update
# ============================================================

@app.post("/predict/demand/{zone_id}/update")
def update_demand(
    zone_id: str,
    update: DemandUpdate
):

    # --------------------------------------------------------
    # Step 1: Get DisasterZone from PostgreSQL
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        disaster_zone = (
            db.query(DisasterZone)
            .filter(
                DisasterZone.zone_id == zone_id
            )
            .first()
        )

    finally:

        db.close()


    if disaster_zone is None:

        raise HTTPException(
            status_code=404,
            detail=f"Zone {zone_id} not found"
        )


    # --------------------------------------------------------
    # Step 2: Get ML data from CSV
    # --------------------------------------------------------

    zone = df[
        df["zone_id"] == zone_id
    ].copy()


    if zone.empty:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Zone {zone_id} has no ML dataset record"
            )
        )


    # --------------------------------------------------------
    # Step 3: Apply updated field/satellite data
    # --------------------------------------------------------

    zone["severity_score"] = (
        update.severity_score
    )


    zone["damage_percent"] = (
        update.damage_percent
    )


    zone["affected_population"] = (
        update.affected_population
    )


    # --------------------------------------------------------
    # Step 4: Recalculate engineered features
    # --------------------------------------------------------

    zone["affected_population_percent"] = (
        zone["affected_population"]
        / zone["population"]
    ) * 100


    zone["vulnerability_score"] = (
        0.35 * zone["elderly_percent"]
        + 0.30 * zone["children_percent"]
        + 0.45 * zone["medically_dependent_percent"]
    )


    zone["impact_score"] = (
        zone["damage_percent"]
        * zone["severity_score"]
    ) / 100


    zone["vulnerability_impact"] = (
        zone["impact_score"]
        * (
            1
            + zone["vulnerability_score"] / 100
        )
    )


    # --------------------------------------------------------
    # Step 5: Prepare ML features
    # --------------------------------------------------------

    X = zone[features]


    # --------------------------------------------------------
    # Step 6: Generate updated predictions
    # --------------------------------------------------------

    predictions = {}


    for resource, model in models.items():

        prediction, lower, upper = (
            get_prediction_with_confidence(
                model,
                X
            )
        )


        predictions[resource] = {

            "prediction": round(
                max(0, prediction),
                2
            ),

            "confidence_interval": {

                "lower": round(
                    max(0, lower),
                    2
                ),

                "upper": round(
                    max(0, upper),
                    2
                )
            }
        }


    # --------------------------------------------------------
    # Step 7: Vulnerability adjustment
    # --------------------------------------------------------

    vulnerability_score = float(
        zone["vulnerability_score"].iloc[0]
    )


    vulnerability_factor = (
        calculate_vulnerability_factor(
            vulnerability_score
        )
    )


    adjusted_predictions = {}


    for resource, values in predictions.items():

        adjusted_prediction = adjust_prediction(
            values["prediction"],
            vulnerability_factor
        )


        adjusted_lower = adjust_prediction(
            values["confidence_interval"]["lower"],
            vulnerability_factor
        )


        adjusted_upper = adjust_prediction(
            values["confidence_interval"]["upper"],
            vulnerability_factor
        )


        adjusted_predictions[resource] = {

            "prediction": round(
                adjusted_prediction,
                2
            ),

            "confidence_interval": {

                "lower": round(
                    adjusted_lower,
                    2
                ),

                "upper": round(
                    adjusted_upper,
                    2
                )
            }
        }


    # --------------------------------------------------------
    # Step 8: Return updated demand
    # --------------------------------------------------------

    return {

        "zone_id": zone_id,

        "update_type": "Dynamic Demand Update",

        "updated_inputs": {

            "severity_score": (
                update.severity_score
            ),

            "damage_percent": (
                update.damage_percent
            ),

            "affected_population": (
                update.affected_population
            )
        },

        "vulnerability_score": round(
            vulnerability_score,
            2
        ),

        "vulnerability_factor": round(
            vulnerability_factor,
            2
        ),

        "predictions": adjusted_predictions
    }