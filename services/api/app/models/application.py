import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class Application(Base):
    __tablename__ = "applications"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    youth_profile_id = Column(GUID, ForeignKey("youth_profiles.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(GUID, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="submitted")  # submitted, reviewed, shortlisted, rejected, accepted, withdrawn
    cover_note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    youth_profile = relationship("YouthProfile", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
