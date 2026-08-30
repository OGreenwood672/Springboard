"""Add the semantic skill catalogue.

Revision ID: 003_semantic_skills
Revises: 002_add_conversations
Create Date: 2026-08-30 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "003_semantic_skills"
down_revision: Union[str, None] = "002_add_conversations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "skill_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("provenance", sa.String(length=40), nullable=False, server_default="model"),
        sa.Column("model_version", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_skill_categories_name", "skill_categories", ["name"], unique=True)

    op.create_table(
        "skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("canonical_name", sa.String(length=255), nullable=False),
        sa.Column("normalized_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("skill_categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("external_uri", sa.String(length=500), nullable=True),
        sa.Column("embedding", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("embedding_model", sa.String(length=100), nullable=True),
        sa.Column("provenance", sa.String(length=40), nullable=False, server_default="user_supplied"),
        sa.Column("model_version", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_skills_normalized_name", "skills", ["normalized_name"], unique=True)
    op.create_index("ix_skills_category_id", "skills", ["category_id"])
    op.create_unique_constraint("uq_skills_external_uri", "skills", ["external_uri"])

    op.create_table(
        "skill_aliases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("skill_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False),
        sa.Column("alias", sa.String(length=255), nullable=False),
        sa.Column("normalized_alias", sa.String(length=255), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1"),
        sa.Column("provenance", sa.String(length=40), nullable=False, server_default="exact"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_skill_aliases_skill_id", "skill_aliases", ["skill_id"])
    op.create_index("ix_skill_aliases_normalized_alias", "skill_aliases", ["normalized_alias"], unique=True)

    op.create_table(
        "skill_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source_skill_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False),
        sa.Column("target_skill_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relationship_type", sa.String(length=50), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1"),
        sa.Column("provenance", sa.String(length=40), nullable=False),
        sa.Column("evidence", sa.Text(), nullable=True),
        sa.Column("model_version", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint(
            "source_skill_id",
            "target_skill_id",
            "relationship_type",
            "provenance",
            name="uq_skill_relationship_source_target_type_provenance",
        ),
    )
    op.create_index("ix_skill_relationships_source_skill_id", "skill_relationships", ["source_skill_id"])
    op.create_index("ix_skill_relationships_target_skill_id", "skill_relationships", ["target_skill_id"])
    op.create_index("ix_skill_relationships_relationship_type", "skill_relationships", ["relationship_type"])


def downgrade() -> None:
    op.drop_table("skill_relationships")
    op.drop_table("skill_aliases")
    op.drop_table("skills")
    op.drop_table("skill_categories")
