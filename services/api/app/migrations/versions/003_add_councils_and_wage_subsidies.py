"""Add councils, wage subsidy schemes, and allocations

Revision ID: 003_add_councils
Revises: 002_add_conversations
Create Date: 2026-08-31 14:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = '003_add_councils'
down_revision: Union[str, None] = '002_add_conversations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. councils table
    op.create_table(
        'councils',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('council_type', sa.String(length=100), nullable=False, server_default='unitary'),
        sa.Column('region', sa.String(length=100), nullable=True),
        sa.Column('contact_name', sa.String(length=255), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('postcode', sa.String(length=20), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_geom', Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('deprivation_focus_areas', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('total_budget_allocated', sa.Float(), nullable=False, server_default='100000.0'),
        sa.Column('total_budget_spent', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_councils_name', 'councils', ['name'])
    op.create_index('ix_councils_postcode', 'councils', ['postcode'])

    # 2. wage_subsidy_schemes table
    op.create_table(
        'wage_subsidy_schemes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('council_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('councils.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('total_budget', sa.Float(), nullable=False, server_default='50000.0'),
        sa.Column('remaining_budget', sa.Float(), nullable=False, server_default='50000.0'),
        sa.Column('subsidy_rate_per_hour', sa.Float(), nullable=False, server_default='4.50'),
        sa.Column('max_hours_per_week_per_youth', sa.Integer(), nullable=False, server_default='16'),
        sa.Column('max_duration_months', sa.Integer(), nullable=False, server_default='6'),
        sa.Column('target_postcodes', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('target_sectors', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('eligibility_criteria', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_wage_subsidy_schemes_council_id', 'wage_subsidy_schemes', ['council_id'])

    # 3. wage_subsidy_allocations table
    op.create_table(
        'wage_subsidy_allocations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scheme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('wage_subsidy_schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('council_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('councils.id', ondelete='CASCADE'), nullable=False),
        sa.Column('business_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('businesses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('opportunity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('opportunities.id', ondelete='SET NULL'), nullable=True),
        sa.Column('youth_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('youth_profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('allocated_amount', sa.Float(), nullable=False),
        sa.Column('hourly_subsidy', sa.Float(), nullable=False, server_default='4.50'),
        sa.Column('max_hours_per_week', sa.Integer(), nullable=False, server_default='16'),
        sa.Column('duration_weeks', sa.Integer(), nullable=False, server_default='24'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pledged'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_wage_subsidy_allocations_council_id', 'wage_subsidy_allocations', ['council_id'])
    op.create_index('ix_wage_subsidy_allocations_business_id', 'wage_subsidy_allocations', ['business_id'])
    op.create_index('ix_wage_subsidy_allocations_status', 'wage_subsidy_allocations', ['status'])

    # 4. Add columns to businesses
    op.add_column('businesses', sa.Column('company_size', sa.String(length=50), nullable=False, server_default='small'))
    op.add_column('businesses', sa.Column('employee_count', sa.Integer(), nullable=False, server_default='8'))
    op.add_column('businesses', sa.Column('annual_turnover_bracket', sa.String(length=50), nullable=True, server_default='100k_500k'))
    op.add_column('businesses', sa.Column('wage_subsidy_eligible', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('businesses', sa.Column('wage_subsidy_status', sa.String(length=50), nullable=False, server_default='eligible'))
    op.add_column('businesses', sa.Column('low_income_catchment_score', sa.Float(), nullable=False, server_default='75.0'))
    op.add_column('businesses', sa.Column('hourly_wage_gap', sa.Float(), nullable=False, server_default='4.44'))
    op.add_column('businesses', sa.Column('current_wage_offered', sa.Float(), nullable=False, server_default='7.00'))
    op.add_column('businesses', sa.Column('target_wage', sa.Float(), nullable=False, server_default='11.44'))
    op.add_column('businesses', sa.Column('youth_mentorship_commitment', sa.Boolean(), nullable=False, server_default='true'))

    # 5. Add columns to youth_profiles
    op.add_column('youth_profiles', sa.Column('is_low_income_eligible', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('youth_profiles', sa.Column('household_income_bracket', sa.String(length=50), nullable=True))
    op.add_column('youth_profiles', sa.Column('pupil_premium_recipient', sa.Boolean(), nullable=False, server_default='false'))

    # 6. Add columns to opportunities
    op.add_column('opportunities', sa.Column('wage_subsidy_applied', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('opportunities', sa.Column('hourly_wage_subsidised', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('opportunities', 'hourly_wage_subsidised')
    op.drop_column('opportunities', 'wage_subsidy_applied')
    op.drop_column('youth_profiles', 'pupil_premium_recipient')
    op.drop_column('youth_profiles', 'household_income_bracket')
    op.drop_column('youth_profiles', 'is_low_income_eligible')
    op.drop_column('businesses', 'youth_mentorship_commitment')
    op.drop_column('businesses', 'target_wage')
    op.drop_column('businesses', 'current_wage_offered')
    op.drop_column('businesses', 'hourly_wage_gap')
    op.drop_column('businesses', 'low_income_catchment_score')
    op.drop_column('businesses', 'wage_subsidy_status')
    op.drop_column('businesses', 'wage_subsidy_eligible')
    op.drop_column('businesses', 'annual_turnover_bracket')
    op.drop_column('businesses', 'employee_count')
    op.drop_column('businesses', 'company_size')

    op.drop_table('wage_subsidy_allocations')
    op.drop_table('wage_subsidy_schemes')
    op.drop_table('councils')

