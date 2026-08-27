"""Initial Schema with PostGIS support

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-27 17:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. qualifications table
    op.create_table(
        'qualifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_qualifications_id', 'qualifications', ['id'], unique=False)
    op.create_index('ix_qualifications_name', 'qualifications', ['name'], unique=True)

    # 3. youth_profiles table
    op.create_table(
        'youth_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('preferred_location', sa.String(length=255), nullable=True),
        sa.Column('postcode', sa.String(length=20), nullable=True),
        sa.Column('max_travel_km', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=False),
        sa.Column('interests', sa.JSON(), nullable=False),
        sa.Column('availability', sa.JSON(), nullable=False),
        sa.Column('education_stage', sa.String(length=100), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('preferred_opportunity_types', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_youth_profiles_id', 'youth_profiles', ['id'], unique=False)
    op.create_index('ix_youth_profiles_user_id', 'youth_profiles', ['user_id'], unique=True)
    op.create_index('ix_youth_profiles_postcode', 'youth_profiles', ['postcode'], unique=False)

    # 4. youth_qualifications table
    op.create_table(
        'youth_qualifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('youth_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('youth_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('qualification_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('qualifications.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('grade', sa.String(length=50), nullable=True),
        sa.Column('year_obtained', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_youth_qualifications_id', 'youth_qualifications', ['id'], unique=False)
    op.create_index('ix_youth_qualifications_youth_profile_id', 'youth_qualifications', ['youth_profile_id'], unique=False)
    op.create_index('ix_youth_qualifications_qualification_id', 'youth_qualifications', ['qualification_id'], unique=False)

    # 5. businesses table
    op.create_table(
        'businesses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('organisation_type', sa.String(length=100), nullable=False),
        sa.Column('contact_name', sa.String(length=255), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('postcode', sa.String(length=20), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_businesses_id', 'businesses', ['id'], unique=False)
    op.create_index('ix_businesses_user_id', 'businesses', ['user_id'], unique=True)
    op.create_index('ix_businesses_name', 'businesses', ['name'], unique=False)
    op.create_index('ix_businesses_postcode', 'businesses', ['postcode'], unique=False)

    # 6. opportunities table
    op.create_table(
        'opportunities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('business_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('businesses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('opportunity_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('required_skills', sa.JSON(), nullable=False),
        sa.Column('preferred_skills', sa.JSON(), nullable=False),
        sa.Column('location_name', sa.String(length=255), nullable=True),
        sa.Column('postcode', sa.String(length=20), nullable=True),
        sa.Column('workplace_type', sa.String(length=50), nullable=False, server_default='in_person'),
        sa.Column('pay_info', sa.String(length=100), nullable=True),
        sa.Column('hours_or_commitment', sa.String(length=100), nullable=True),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_opportunities_id', 'opportunities', ['id'], unique=False)
    op.create_index('ix_opportunities_business_id', 'opportunities', ['business_id'], unique=False)
    op.create_index('ix_opportunities_title', 'opportunities', ['title'], unique=False)
    op.create_index('ix_opportunities_opportunity_type', 'opportunities', ['opportunity_type'], unique=False)
    op.create_index('ix_opportunities_status', 'opportunities', ['status'], unique=False)
    op.create_index('ix_opportunities_workplace_type', 'opportunities', ['workplace_type'], unique=False)
    op.create_index('ix_opportunities_postcode', 'opportunities', ['postcode'], unique=False)

    # 7. applications table
    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('youth_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('youth_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('opportunity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='submitted'),
        sa.Column('cover_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('youth_profile_id', 'opportunity_id', name='uq_youth_opportunity_application'),
    )
    op.create_index('ix_applications_id', 'applications', ['id'], unique=False)
    op.create_index('ix_applications_youth_profile_id', 'applications', ['youth_profile_id'], unique=False)
    op.create_index('ix_applications_opportunity_id', 'applications', ['opportunity_id'], unique=False)
    op.create_index('ix_applications_status', 'applications', ['status'], unique=False)

    # 8. matches table
    op.create_table(
        'matches',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('youth_profile_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('youth_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('opportunity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('factors', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('youth_profile_id', 'opportunity_id', name='uq_youth_opportunity_match'),
    )
    op.create_index('ix_matches_id', 'matches', ['id'], unique=False)
    op.create_index('ix_matches_youth_profile_id', 'matches', ['youth_profile_id'], unique=False)
    op.create_index('ix_matches_opportunity_id', 'matches', ['opportunity_id'], unique=False)


def downgrade() -> None:
    op.drop_table('matches')
    op.drop_table('applications')
    op.drop_table('opportunities')
    op.drop_table('businesses')
    op.drop_table('youth_qualifications')
    op.drop_table('youth_profiles')
    op.drop_table('qualifications')
    op.drop_table('users')

