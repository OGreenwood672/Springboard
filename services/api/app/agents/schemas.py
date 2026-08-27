import re
from uuid import UUID
from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict


UK_POSTCODE_REGEX = re.compile(
    r"^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|[A-Z]{1,2}\d{1,2})$",
    re.IGNORECASE,
)


def validate_uk_postcode(v: Optional[str]) -> Optional[str]:
    if v is None or not v.strip():
        return None
    cleaned = v.strip().upper()
    # Accept inward + outward, or just outward area (e.g. HP5, SW1A)
    return cleaned


class YouthAvailabilitySchema(BaseModel):
    days: List[str] = []
    hours_per_week: Optional[int] = Field(default=None, ge=1, le=48)


class YouthQualificationItemSchema(BaseModel):
    name: str
    grade: Optional[str] = None
    year_obtained: Optional[int] = None


class YouthProfilePatchSchema(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=150)
    postcode: Optional[str] = None
    max_travel_km: Optional[int] = Field(default=None, ge=1, le=100)
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    availability: Optional[YouthAvailabilitySchema] = None
    education_stage: Optional[Literal["secondary", "sixth_form", "college", "university", "other"]] = None
    qualifications: Optional[List[YouthQualificationItemSchema]] = None
    preferred_opportunity_types: Optional[List[Literal["part_time_job", "work_experience", "volunteering"]]] = None
    bio: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("postcode")
    @classmethod
    def check_postcode(cls, v):
        return validate_uk_postcode(v)


class BusinessProfilePatchSchema(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    organisation_type: Optional[str] = Field(default=None, max_length=100)
    contact_name: Optional[str] = Field(default=None, max_length=150)
    contact_email: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=2000)
    address: Optional[str] = Field(default=None, max_length=300)
    postcode: Optional[str] = None
    website: Optional[str] = None

    @field_validator("postcode")
    @classmethod
    def check_postcode(cls, v):
        return validate_uk_postcode(v)


class OpportunityDraftExtractionSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    opportunity_type: Literal["part_time_job", "work_experience", "volunteering"]
    description: str = Field(..., min_length=10, max_length=5000)
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    location_name: Optional[str] = None
    postcode: Optional[str] = None
    workplace_type: Literal["in_person", "hybrid", "remote"] = "in_person"
    pay_info: Optional[str] = Field(default=None, max_length=100)
    hours_or_commitment: Optional[str] = Field(default=None, max_length=100)
    deadline: Optional[datetime] = None
    status: Optional[Literal["draft", "published", "closed"]] = "draft"

    @field_validator("postcode")
    @classmethod
    def check_postcode(cls, v):
        return validate_uk_postcode(v)


class OpportunitySearchFiltersSchema(BaseModel):
    keyword: Optional[str] = None
    opportunity_type: Optional[Literal["part_time_job", "work_experience", "volunteering"]] = None
    workplace_type: Optional[Literal["in_person", "hybrid", "remote"]] = None
    location: Optional[str] = None
    max_distance_km: Optional[float] = Field(default=None, ge=1, le=100)


class CandidateSearchFiltersSchema(BaseModel):
    opportunity_id: UUID
    min_score: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    max_distance_km: Optional[float] = Field(default=None, ge=1.0, le=100.0)


class ApplicationDraftSchema(BaseModel):
    opportunity_id: UUID
    cover_note: Optional[str] = Field(default=None, max_length=2000)


# ==========================================
# Agent Output & Card DTOs
# ==========================================

class UICardPayload(BaseModel):
    id: str
    card_type: Literal[
        "confirmation_card",
        "opportunity_recommendation",
        "candidate_match",
        "profile_summary",
        "opportunity_draft",
    ]
    data: Dict[str, Any]


class PendingActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    conversation_id: UUID
    action_type: str
    payload: Dict[str, Any]
    status: str
    expires_at: datetime
    created_at: datetime
    confirmed_at: Optional[datetime] = None


class AgentChatResponse(BaseModel):
    conversation_id: UUID
    message: str
    ui_cards: List[UICardPayload] = []
    pending_action: Optional[PendingActionOut] = None


class ActionConfirmationResult(BaseModel):
    pending_action_id: UUID
    status: str
    message: str
    result_data: Optional[Dict[str, Any]] = None

