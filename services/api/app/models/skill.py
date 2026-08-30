import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, JSON, String, Text, UniqueConstraint

from app.core.time import utc_now
from app.database import Base, GUID


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    embedding = Column(JSON, nullable=True)
    embedding_model = Column(String(100), nullable=True)
    provenance = Column(String(40), nullable=False, default="model")
    model_version = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    canonical_name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(GUID(), ForeignKey("skill_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    external_uri = Column(String(500), nullable=True, unique=True)
    embedding = Column(JSON, nullable=True)
    embedding_model = Column(String(100), nullable=True)
    provenance = Column(String(40), nullable=False, default="user_supplied")
    model_version = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(255), nullable=False)
    normalized_alias = Column(String(255), nullable=False, unique=True, index=True)
    confidence = Column(Float, nullable=False, default=1.0)
    provenance = Column(String(40), nullable=False, default="exact")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class SkillRelationship(Base):
    __tablename__ = "skill_relationships"
    __table_args__ = (
        UniqueConstraint(
            "source_skill_id",
            "target_skill_id",
            "relationship_type",
            "provenance",
            name="uq_skill_relationship_source_target_type_provenance",
        ),
    )

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    source_skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    target_skill_id = Column(GUID(), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False, index=True)
    weight = Column(Float, nullable=False, default=1.0)
    confidence = Column(Float, nullable=False, default=1.0)
    provenance = Column(String(40), nullable=False)
    evidence = Column(Text, nullable=True)
    model_version = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
