import uuid
from sqlalchemy import Column, Float, JSON, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint(
            "youth_profile_id",
            "opportunity_id",
            name="uq_youth_opportunity_match",
        ),
    )

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    youth_profile_id = Column(
        GUID(),
        ForeignKey("youth_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    opportunity_id = Column(
        GUID(),
        ForeignKey("opportunities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score = Column(Float, nullable=False, default=0.0)
    factors = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    youth_profile = relationship("YouthProfile", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")

