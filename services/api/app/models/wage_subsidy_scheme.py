import uuid
from sqlalchemy import Column, String, Float, Text, JSON, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class WageSubsidyScheme(Base):
    __tablename__ = "wage_subsidy_schemes"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    council_id = Column(
        GUID(),
        ForeignKey("councils.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    total_budget = Column(Float, nullable=False, default=50000.0)
    remaining_budget = Column(Float, nullable=False, default=50000.0)
    subsidy_rate_per_hour = Column(Float, nullable=False, default=4.50)  # £4.50/hr top-up
    max_hours_per_week_per_youth = Column(Integer, default=16, nullable=False)
    max_duration_months = Column(Integer, default=6, nullable=False)
    target_postcodes = Column(JSON, default=list, nullable=False)
    target_sectors = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    eligibility_criteria = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    council = relationship("Council", back_populates="schemes")
    allocations = relationship(
        "WageSubsidyAllocation",
        back_populates="scheme",
        cascade="all, delete-orphan",
    )

