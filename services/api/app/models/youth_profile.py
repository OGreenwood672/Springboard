import uuid
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID, PointGeometry
from app.core.time import utc_now


class YouthProfile(Base):
    __tablename__ = "youth_profiles"

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
    full_name = Column(String(255), nullable=False)
    preferred_location = Column(String(255), nullable=True)
    postcode = Column(String(20), nullable=True, index=True)
    max_travel_km = Column(Integer, default=15, nullable=False)

    # PostGIS Location & Coordinate fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_geom = Column(PointGeometry, nullable=True)

    # Profile Attributes
    skills = Column(JSON, default=list, nullable=False)  # List of skill strings
    interests = Column(JSON, default=list, nullable=False)  # List of interest strings
    availability = Column(JSON, default=dict, nullable=False)  # {"days": [...], "hours_per_week": int}
    education_stage = Column(String(100), nullable=True)  # e.g., "secondary", "sixth_form", "college", "university", "other"
    bio = Column(Text, nullable=True)
    preferred_opportunity_types = Column(JSON, default=list, nullable=False)  # ['part_time_job', 'work_experience', 'volunteering']

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="youth_profile")
    qualifications = relationship(
        "YouthQualification",
        back_populates="youth_profile",
        cascade="all, delete-orphan",
    )
    applications = relationship(
        "Application",
        back_populates="youth_profile",
        cascade="all, delete-orphan",
    )
    matches = relationship(
        "Match",
        back_populates="youth_profile",
        cascade="all, delete-orphan",
    )

