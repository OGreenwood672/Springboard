import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class User(Base):
    __tablename__ = "users"

    id = Column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'youth', 'business', or 'council'
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationships
    youth_profile = relationship(
        "YouthProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    business = relationship(
        "Business",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    council = relationship(
        "Council",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

