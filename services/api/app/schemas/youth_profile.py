from uuid import UUID
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, field_validator


class YouthQualificationBase(BaseModel):
    name: str
    grade: Optional[str] = None
    year_obtained: Optional[int] = None
    qualification_id: Optional[UUID] = None


class YouthQualificationCreate(YouthQualificationBase):
    pass


class YouthQualificationOut(YouthQualificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class YouthAvailabilitySchema(BaseModel):
    days: List[str] = []
    hours_per_week: Optional[int] = None


class YouthProfileBase(BaseModel):
    full_name: str
    preferred_location: Optional[str] = None
    postcode: Optional[str] = None
    max_travel_km: int = 15
    skills: List[str] = []
    interests: List[str] = []
    availability: Optional[YouthAvailabilitySchema] = None
    education_stage: Optional[str] = None
    bio: Optional[str] = None
    preferred_opportunity_types: List[str] = []

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class YouthProfileCreate(YouthProfileBase):
    qualifications: Optional[List[YouthQualificationCreate]] = []


class YouthProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_location: Optional[str] = None
    postcode: Optional[str] = None
    max_travel_km: Optional[int] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    availability: Optional[YouthAvailabilitySchema] = None
    education_stage: Optional[str] = None
    bio: Optional[str] = None
    preferred_opportunity_types: Optional[List[str]] = None
    qualifications: Optional[List[YouthQualificationCreate]] = None

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class YouthProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    full_name: str
    preferred_location: Optional[str] = None
    postcode: Optional[str] = None
    max_travel_km: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    skills: List[str] = []
    interests: List[str] = []
    availability: Dict[str, Any] = {}
    education_stage: Optional[str] = None
    bio: Optional[str] = None
    preferred_opportunity_types: List[str] = []
    qualifications: List[YouthQualificationOut] = []
    created_at: datetime
    updated_at: datetime

