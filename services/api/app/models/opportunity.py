import uuid
from sqlalchemy import Column, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID, PointGeometry
from app.core.time import utc_now


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    business_id = Column(
        GUID(),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False, index=True)
    opportunity_type = Column(
        String(50),
        nullable=False,
        index=True,
    )  # 'part_time_job', 'work_experience', 'volunteering'
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list, nullable=False)
    preferred_skills = Column(JSON, default=list, nullable=False)
    location_name = Column(String(255), nullable=True)
    postcode = Column(String(20), nullable=True, index=True)
    workplace_type = Column(
        String(50),
        default="in_person",
        nullable=False,
        index=True,
    )  # 'in_person', 'hybrid', 'remote'
    pay_info = Column(String(100), nullable=True)  # e.g., '£11.44 / hour', 'Unpaid volunteer', etc.
    hours_or_commitment = Column(String(100), nullable=True)  # e.g., '8 hours/week (Saturdays)'
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        String(50),
        default="draft",
        nullable=False,
        index=True,
    )  # 'draft', 'published', 'closed'

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
    business = relationship("Business", back_populates="opportunities")
    applications = relationship(
        "Application",
        back_populates="opportunity",
        cascade="all, delete-orphan",
    )
    matches = relationship(
        "Match",
        back_populates="opportunity",
        cascade="all, delete-orphan",
    )

