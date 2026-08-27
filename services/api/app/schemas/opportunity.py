from uuid import UUID
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, field_validator


class OpportunityBase(BaseModel):
    title: str
    opportunity_type: Literal["part_time_job", "work_experience", "volunteering"]
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    location_name: Optional[str] = None
    postcode: Optional[str] = None
    workplace_type: Literal["in_person", "hybrid", "remote"] = "in_person"
    pay_info: Optional[str] = None
    hours_or_commitment: Optional[str] = None
    deadline: Optional[datetime] = None

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class OpportunityCreate(OpportunityBase):
    status: Optional[Literal["draft", "published", "closed"]] = "draft"


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    opportunity_type: Optional[Literal["part_time_job", "work_experience", "volunteering"]] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    location_name: Optional[str] = None
    postcode: Optional[str] = None
    workplace_type: Optional[Literal["in_person", "hybrid", "remote"]] = None
    pay_info: Optional[str] = None
    hours_or_commitment: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[Literal["draft", "published", "closed"]] = None

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class OpportunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    business_name: Optional[str] = None
    organisation_type: Optional[str] = None
    title: str
    opportunity_type: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    location_name: Optional[str] = None
    postcode: Optional[str] = None
    workplace_type: str
    pay_info: Optional[str] = None
    hours_or_commitment: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    applications_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime
