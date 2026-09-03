from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field


class CouncilOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    council_type: str
    region: Optional[str] = None
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    postcode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    deprivation_focus_areas: List[str] = Field(default_factory=list)
    total_budget_allocated: float
    total_budget_spent: float
    created_at: datetime
    updated_at: datetime


class CouncilUpdate(BaseModel):
    name: Optional[str] = None
    council_type: Optional[str] = None
    region: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    postcode: Optional[str] = None
    deprivation_focus_areas: Optional[List[str]] = None
    total_budget_allocated: Optional[float] = None


class WageSubsidySchemeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    total_budget: float = Field(gt=0, default=50000.0)
    subsidy_rate_per_hour: float = Field(gt=0, default=4.50)
    max_hours_per_week_per_youth: int = Field(gt=0, le=40, default=16)
    max_duration_months: int = Field(gt=0, le=24, default=6)
    target_postcodes: List[str] = Field(default_factory=list)
    target_sectors: List[str] = Field(default_factory=list)
    eligibility_criteria: Dict[str, Any] = Field(default_factory=dict)


class WageSubsidySchemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    council_id: UUID
    title: str
    description: Optional[str] = None
    total_budget: float
    remaining_budget: float
    subsidy_rate_per_hour: float
    max_hours_per_week_per_youth: int
    max_duration_months: int
    target_postcodes: List[str] = Field(default_factory=list)
    target_sectors: List[str] = Field(default_factory=list)
    is_active: bool
    eligibility_criteria: Dict[str, Any] = Field(default_factory=dict)
    allocations_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime


class WageSubsidyAllocationCreate(BaseModel):
    scheme_id: UUID
    business_id: UUID
    opportunity_id: Optional[UUID] = None
    youth_profile_id: Optional[UUID] = None
    hourly_subsidy: float = Field(gt=0, default=4.50)
    max_hours_per_week: int = Field(gt=0, le=40, default=16)
    duration_weeks: int = Field(gt=0, le=52, default=24)
    notes: Optional[str] = None


class WageSubsidyAllocationUpdate(BaseModel):
    status: Literal["pledged", "approved", "active", "completed", "cancelled"]
    notes: Optional[str] = None


class WageSubsidyAllocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scheme_id: UUID
    council_id: UUID
    business_id: UUID
    opportunity_id: Optional[UUID] = None
    youth_profile_id: Optional[UUID] = None
    allocated_amount: float
    hourly_subsidy: float
    max_hours_per_week: int
    duration_weeks: int
    status: str
    notes: Optional[str] = None
    business_name: Optional[str] = None
    scheme_title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CouncilMapMarkerOut(BaseModel):
    id: str
    business_id: str
    name: str
    organisation_type: str
    address: Optional[str] = None
    postcode: Optional[str] = None
    latitude: float
    longitude: float
    company_size: str
    employee_count: int
    wage_subsidy_status: str
    hourly_wage_gap: float
    current_wage_offered: float
    target_wage: float
    low_income_catchment_score: float
    open_opportunities_count: int
    youth_mentorship_commitment: bool
    contact_name: str
    contact_email: str
    ai_funding_score: Optional[float] = 85.0
    ai_funding_tier: Optional[str] = "Tier 1 — High Impact SROI"
    ai_research_summary: Optional[str] = None
    ai_role_viability: Optional[str] = None
    employee_reviews_summary: Optional[str] = None
    employee_review_rating: Optional[float] = 4.8
    employee_review_count: Optional[int] = 12


class DeprivationAreaOut(BaseModel):
    ward_name: str
    postcode_prefix: str
    deprivation_decile: int
    youth_population_estimate: int
    low_income_family_percentage: float
    center_lat: float
    center_lng: float
    radius_meters: float


class CouncilMapDataOut(BaseModel):
    council: CouncilOut
    markers: List[CouncilMapMarkerOut]
    deprivation_areas: List[DeprivationAreaOut]
    summary: Dict[str, Any]


class EligibleBusinessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    organisation_type: str
    address: Optional[str] = None
    postcode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    company_size: str
    employee_count: int
    wage_subsidy_eligible: bool
    wage_subsidy_status: str
    low_income_catchment_score: float
    hourly_wage_gap: float
    current_wage_offered: float
    target_wage: float
    youth_mentorship_commitment: bool
    open_opportunities_count: int
    contact_name: str
    contact_email: str
    ai_funding_score: Optional[float] = 85.0
    ai_funding_tier: Optional[str] = "Tier 1 — High Impact SROI"
    ai_research_summary: Optional[str] = None
    ai_role_viability: Optional[str] = None
    employee_reviews_summary: Optional[str] = None
    employee_review_rating: Optional[float] = 4.8
    employee_review_count: Optional[int] = 12


class CouncilAnalyticsOut(BaseModel):
    total_budget_allocated: float
    total_budget_spent: float
    remaining_budget: float
    total_subsidies_active: int
    total_youth_supported_low_income: int
    total_hours_subsidised: int
    average_hourly_top_up: float
    participating_businesses_count: int
    retention_rate_percentage: float
    social_mobility_roi_multiplier: float
    monthly_trends: List[Dict[str, Any]]
    sector_breakdown: List[Dict[str, Any]]

