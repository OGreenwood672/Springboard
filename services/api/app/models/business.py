import uuid
from sqlalchemy import Column, String, Float, Text, Integer, Boolean, DateTime, ForeignKey
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

    # Wage Subsidy & SME Economic Profile
    company_size = Column(String(50), default="small", nullable=False)  # "micro" (<10), "small" (10-49), "medium" (50-249), "large" (250+)
    employee_count = Column(Integer, default=8, nullable=False)
    annual_turnover_bracket = Column(String(50), default="100k_500k", nullable=True)  # "under_100k", "100k_500k", "500k_1m", "1m_plus"
    wage_subsidy_eligible = Column(Boolean, default=True, nullable=False)
    wage_subsidy_status = Column(String(50), default="eligible", nullable=False)  # "not_applied", "eligible", "pledged", "approved", "active_subsidised", "ineligible"
    low_income_catchment_score = Column(Float, default=75.0, nullable=False)  # 0 to 100
    hourly_wage_gap = Column(Float, default=4.44, nullable=False)  # Gap to Real Living Wage (target £11.44 - affordable £7.00 = £4.44)
    current_wage_offered = Column(Float, default=7.00, nullable=False)
    target_wage = Column(Float, default=11.44, nullable=False)
    youth_mentorship_commitment = Column(Boolean, default=True, nullable=False)

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
    subsidy_allocations = relationship(
        "WageSubsidyAllocation",
        back_populates="business",
        cascade="all, delete-orphan",
    )
