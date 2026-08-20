from fastapi import FastAPI, HTTPException

from app.database import engine, SessionLocal, Base
from app import (
    models,
    schemas,
    gdacs,
    usgs,
    ndma,
    satellite,
    normalize,
    geospatial,
    population,
    osm,
    severity
)

# ============================================================
# Milestone 2 imports
# ============================================================

from prediction_api import (
    predict_demand,
    update_demand,
    DemandUpdate
)


# ============================================================
# Create database tables
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="AI Disaster Response Management System",
    description=(
        "AI-based Disaster Response Management System "
        "combining Milestone 1 APIs and Milestone 2 "
        "ML-based resource demand prediction."
    ),
    version="2.0"
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "AI Disaster Response Management System",
        "status": "running",
        "milestone_1": "completed",
        "milestone_2": "completed"
    }


# ============================================================
# MILESTONE 1 - RESOURCE MANAGEMENT
# ============================================================


# ------------------------------------------------------------
# Create Resource
# ------------------------------------------------------------

@app.post("/resources")
def create_resource(resource: schemas.ResourceCreate):

    db = SessionLocal()

    try:

        new_resource = models.Resource(
            name=resource.name,
            quantity=resource.quantity,
            location=resource.location
        )

        db.add(new_resource)
        db.commit()
        db.refresh(new_resource)

        return new_resource

    finally:
        db.close()


# ------------------------------------------------------------
# Get All Resources
# ------------------------------------------------------------

@app.get("/resources")
def get_resources():

    db = SessionLocal()

    try:

        resources = (
            db.query(models.Resource)
            .all()
        )

        return resources

    finally:
        db.close()


# ------------------------------------------------------------
# Get Resource By ID
# ------------------------------------------------------------

@app.get("/resources/{resource_id}")
def get_resource(resource_id: int):

    db = SessionLocal()

    try:

        resource = (
            db.query(models.Resource)
            .filter(
                models.Resource.id == resource_id
            )
            .first()
        )

        if resource is None:

            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        return resource

    finally:
        db.close()


# ------------------------------------------------------------
# Update Resource
# ------------------------------------------------------------

@app.put("/resources/{resource_id}")
def update_resource(
    resource_id: int,
    updated: schemas.ResourceCreate
):

    db = SessionLocal()

    try:

        resource = (
            db.query(models.Resource)
            .filter(
                models.Resource.id == resource_id
            )
            .first()
        )

        if resource is None:

            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        resource.name = updated.name
        resource.quantity = updated.quantity
        resource.location = updated.location

        db.commit()
        db.refresh(resource)

        return resource

    finally:
        db.close()


# ------------------------------------------------------------
# Delete Resource
# ------------------------------------------------------------

@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: int):

    db = SessionLocal()

    try:

        resource = (
            db.query(models.Resource)
            .filter(
                models.Resource.id == resource_id
            )
            .first()
        )

        if resource is None:

            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        db.delete(resource)
        db.commit()

        return {
            "message": "Resource deleted successfully"
        }

    finally:
        db.close()


# ============================================================
# MILESTONE 1 - EXTERNAL DISASTER DATA
# ============================================================


# ------------------------------------------------------------
# GDACS
# ------------------------------------------------------------

@app.get("/gdacs")
def fetch_gdacs():

    return gdacs.get_gdacs_events()


# ------------------------------------------------------------
# USGS
# ------------------------------------------------------------

@app.get("/usgs")
def fetch_usgs():

    return usgs.get_earthquakes()


# ------------------------------------------------------------
# NDMA
# ------------------------------------------------------------

@app.get("/ndma")
def fetch_ndma():

    return ndma.get_ndma_alerts()


# ------------------------------------------------------------
# Satellite
# ------------------------------------------------------------

@app.get("/satellite")
def fetch_satellite():

    return satellite.get_satellite_data()


# ------------------------------------------------------------
# Normalize
# ------------------------------------------------------------

@app.get("/normalize")
def normalize_data():

    sample_data = {
        "event": "Earthquake",
        "location": "India",
        "severity": "High"
    }

    return normalize.normalize_disaster_data(
        source="USGS",
        data=sample_data
    )


# ------------------------------------------------------------
# Geospatial Impact
# ------------------------------------------------------------

@app.get("/geospatial")
def geospatial_impact():

    return geospatial.get_geospatial_impact()


# ------------------------------------------------------------
# Population Density
# ------------------------------------------------------------

@app.get("/population")
def population_density():

    return population.get_population_density()


# ------------------------------------------------------------
# Buildings / OSM
# ------------------------------------------------------------

@app.get("/buildings")
def buildings():

    return osm.get_buildings()


# ------------------------------------------------------------
# Severity
# ------------------------------------------------------------

@app.get("/severity")
def severity_score():

    return severity.calculate_severity()


# ============================================================
# MILESTONE 2 - AI DEMAND PREDICTION
# ============================================================


# ------------------------------------------------------------
# Normal Demand Prediction
# ------------------------------------------------------------

@app.post("/predict/demand/{zone_id}")
def demand_prediction(zone_id: str):

    return predict_demand(zone_id)


# ------------------------------------------------------------
# Dynamic Demand Update
# ------------------------------------------------------------

@app.post("/predict/demand/{zone_id}/update")
def dynamic_demand_update(
    zone_id: str,
    update: DemandUpdate
):

    return update_demand(
        zone_id,
        update
    )


# ============================================================
# END
# ============================================================