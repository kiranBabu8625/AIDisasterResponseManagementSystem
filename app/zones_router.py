"""
Zones Listing Router
====================================================
Adds a GET endpoint that returns ALL disaster zones from the real
DisasterZone table (Milestone 1), so the dashboard can show real
zones instead of hardcoded sample data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import DisasterZone

router = APIRouter(prefix="/zones", tags=["Zones"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/list")
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(DisasterZone).all()
    return {
        "zones": [
            {
                "zone_id": z.zone_id,
                "grid_id": z.grid_id,
                "disaster_type": z.disaster_type,
                "severity_score": z.severity_score,
                "severity_level": z.severity_level,
                "latitude": float(z.latitude),
                "longitude": float(z.longitude),
                "radius_km": z.radius_km,
            }
            for z in zones
        ]
    }
