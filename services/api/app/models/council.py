import uuid
from sqlalchemy import Column, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID, PointGeometry
from app.core.time import utc_now


class Council(Base):
    __tablename__ = "councils"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id = Column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    council_type = Column(String(100), default="unitary", nullable=False)  # "unitary", "county", "district", "london_borough", "metropolitan"
    region = Column(String(100), nullable=True)  # e.g., "South East", "London"
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    postcode = Column(String(20), nullable=True, index=True)

    # PostGIS Location & Coordinate fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_geom = Column(PointGeometry, nullable=True)

    deprivation_focus_areas = Column(JSON, default=list, nullable=False)  # List of target ward/postcode strings (e.g. ["HP5 1", "HP5 2"])
    total_budget_allocated = Column(Float, default=100000.0, nullable=False)
    total_budget_spent = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="council")
    schemes = relationship(
        "WageSubsidyScheme",
        back_populates="council",
        cascade="all, delete-orphan",
    )
    allocations = relationship(
        "WageSubsidyAllocation",
        back_populates="council",
        cascade="all, delete-orphan",
    )

