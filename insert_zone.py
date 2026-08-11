from app.database import SessionLocal
from app.models import DisasterZone


db = SessionLocal()


zone = DisasterZone(
    zone_id="Z0001",
    grid_id="A1",
    disaster_type="Earthquake",
    severity_score=92,
    severity_level="Critical",
    latitude="17.3850",
    longitude="78.4867",
    radius_km=15
)


db.add(zone)
db.commit()
db.refresh(zone)

print("Zone inserted successfully!")
print("Zone ID:", zone.zone_id)
print("Severity:", zone.severity_score)
print("Location:", zone.latitude, zone.longitude)

db.close()