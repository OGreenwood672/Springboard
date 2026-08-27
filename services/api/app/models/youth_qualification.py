import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class YouthQualification(Base):
    __tablename__ = "youth_qualifications"

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
    qualification_id = Column(
        GUID(),
        ForeignKey("qualifications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name = Column(String(255), nullable=False)
    grade = Column(String(50), nullable=True)
    year_obtained = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    youth_profile = relationship("YouthProfile", back_populates="qualifications")
    qualification = relationship("Qualification", back_populates="youth_qualifications")

