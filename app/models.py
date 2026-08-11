from sqlalchemy import Column, Integer, String
from app.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    location = Column(String, nullable=False)


class DisasterZone(Base):
    __tablename__ = "disaster_zones"

    id = Column(Integer, primary_key=True, index=True)

    zone_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    grid_id = Column(
        String,
        nullable=False
    )

    disaster_type = Column(
        String,
        nullable=False
    )

    severity_score = Column(
        Integer,
        nullable=False
    )

    severity_level = Column(
        String,
        nullable=False
    )

    latitude = Column(
        String,
        nullable=False
    )

    longitude = Column(
        String,
        nullable=False
    )

    radius_km = Column(
        Integer,
        nullable=False
    )