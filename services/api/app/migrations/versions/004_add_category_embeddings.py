"""Add semantic embeddings to skill categories.

Revision ID: 004_category_embeddings
Revises: 003_semantic_skills
Create Date: 2026-08-30 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "004_category_embeddings"
down_revision: Union[str, None] = "003_semantic_skills"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "skill_categories",
        sa.Column("embedding", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "skill_categories",
        sa.Column("embedding_model", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("skill_categories", "embedding_model")
    op.drop_column("skill_categories", "embedding")
