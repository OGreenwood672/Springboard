import uuid
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID, PointGeometry
from app.core.time import utc_now


class Business(Base):
    __tablename__ = "businesses"

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
    organisation_type = Column(String(100), nullable=False)  # e.g. "Retail", "Technology", "Charity", "Hospitality"
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    postcode = Column(String(20), nullable=True, index=True)
    website = Column(String(255), nullable=True)

    # PostGIS Location & Coordinate fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_geom = Column(PointGeometry, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="business")
    opportunities = relationship(
        "Opportunity",
        back_populates="business",
        cascade="all, delete-orphan",
    )

