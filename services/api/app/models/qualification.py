import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class Qualification(Base):
    __tablename__ = "qualifications"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=True)  # e.g., GCSE, A-Level, BTEC, T-Level, Vocational
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    youth_qualifications = relationship("YouthQualification", back_populates="qualification")

