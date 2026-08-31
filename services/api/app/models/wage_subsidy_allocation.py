import uuid
from sqlalchemy import Column, String, Float, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class WageSubsidyAllocation(Base):
    __tablename__ = "wage_subsidy_allocations"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    scheme_id = Column(
        GUID(),
        ForeignKey("wage_subsidy_schemes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    council_id = Column(
        GUID(),
        ForeignKey("councils.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    business_id = Column(
        GUID(),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    opportunity_id = Column(
        GUID(),
        ForeignKey("opportunities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    youth_profile_id = Column(
        GUID(),
        ForeignKey("youth_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    allocated_amount = Column(Float, nullable=False)  # e.g. £1,728 (£4.50 * 16 hrs * 24 wks)
    hourly_subsidy = Column(Float, nullable=False, default=4.50)
    max_hours_per_week = Column(Integer, default=16, nullable=False)
    duration_weeks = Column(Integer, default=24, nullable=False)
    status = Column(String(50), default="pledged", nullable=False)  # "pledged", "approved", "active", "completed", "cancelled"
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    scheme = relationship("WageSubsidyScheme", back_populates="allocations")
    council = relationship("Council", back_populates="allocations")
    business = relationship("Business", back_populates="subsidy_allocations")
    opportunity = relationship("Opportunity", back_populates="subsidy_allocations")
    youth_profile = relationship("YouthProfile", back_populates="subsidy_allocations")

