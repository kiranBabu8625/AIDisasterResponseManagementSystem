from app.database import SessionLocal
from app.models import DisasterZone

db = SessionLocal()

new_zones = [
    DisasterZone(
        zone_id="Z0002",
        grid_id="A2",
        disaster_type="Flood",
        severity_score=68,
        severity_level="Moderate",
        latitude="17.4400",
        longitude="78.4983",
        radius_km=10
    ),
    DisasterZone(
        zone_id="Z0003",
        grid_id="B1",
        disaster_type="Cyclone",
        severity_score=85,
        severity_level="Critical",
        latitude="17.3616",
        longitude="78.4747",
        radius_km=20
    ),
    DisasterZone(
        zone_id="Z0004",
        grid_id="B2",
        disaster_type="Flood",
        severity_score=45,
        severity_level="Low",
        latitude="17.4239",
        longitude="78.4738",
        radius_km=8
    ),
]

for zone in new_zones:
    db.add(zone)

db.commit()

for zone in new_zones:
    db.refresh(zone)
    print(f"Inserted {zone.zone_id} — {zone.disaster_type}, severity {zone.severity_score}")

db.close()
