from fastapi import FastAPI, HTTPException
from app.database import engine, SessionLocal, Base
from app import models, schemas, gdacs, usgs, ndma, satellite, normalize, geospatial, population, osm, severity

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Disaster Response Management System",
    version="1.0"
)


# Home API
@app.get("/")
def home():
    return {
        "message": "AI Disaster Response Management System"
    }


# Create Resource
@app.post("/resources")
def create_resource(resource: schemas.ResourceCreate):
    db = SessionLocal()

    new_resource = models.Resource(
        name=resource.name,
        quantity=resource.quantity,
        location=resource.location
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    db.close()

    return new_resource


# Get All Resources
@app.get("/resources")
def get_resources():
    db = SessionLocal()

    resources = db.query(models.Resource).all()

    db.close()

    return resources


# Get Resource by ID
@app.get("/resources/{resource_id}")
def get_resource(resource_id: int):
    db = SessionLocal()

    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()

    db.close()

    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    return resource


# Update Resource
@app.put("/resources/{resource_id}")
def update_resource(resource_id: int, updated: schemas.ResourceCreate):
    db = SessionLocal()

    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()

    if resource is None:
        db.close()
        raise HTTPException(status_code=404, detail="Resource not found")

    resource.name = updated.name
    resource.quantity = updated.quantity
    resource.location = updated.location

    db.commit()
    db.refresh(resource)
    db.close()

    return resource


# Delete Resource
@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: int):
    db = SessionLocal()

    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id
    ).first()

    if resource is None:
        db.close()
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(resource)
    db.commit()
    db.close()

    return {"message": "Resource deleted successfully"}


# GDACS API
@app.get("/gdacs")
def fetch_gdacs():
    return gdacs.get_gdacs_events()

# USGS Earthquake API
@app.get("/usgs")
def fetch_usgs():
    return usgs.get_earthquakes()

@app.get("/ndma")
def fetch_ndma():
    return ndma.get_ndma_alerts()

@app.get("/satellite")
def fetch_satellite():
    return satellite.get_satellite_data()

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

@app.get("/geospatial")
def geospatial_impact():
    return geospatial.get_geospatial_impact()

@app.get("/population")
def population_density():
    return population.get_population_density()

@app.get("/buildings")
def buildings():
    return osm.get_buildings()

@app.get("/severity")
def severity_score():
    return severity.calculate_severity()