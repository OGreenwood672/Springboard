from typing import List, Optional
from pydantic import BaseModel, Field


class AICoachExtractRequest(BaseModel):
    message: str = Field(..., min_length=2, description="Youth free-text conversation or profile description")


class AICoachAvailability(BaseModel):
    days: List[str] = []
    hours_per_week: Optional[int] = None


class AICoachQualification(BaseModel):
    name: str
    grade: Optional[str] = None


class AICoachLocation(BaseModel):
    postcode: Optional[str] = None
    max_travel_km: int = 15


class AICoachExtractedProfile(BaseModel):
    skills: List[str] = []
    interests: List[str] = []
    availability: AICoachAvailability = Field(default_factory=AICoachAvailability)
    education_stage: Optional[str] = None
    qualifications: List[AICoachQualification] = []
    preferred_opportunity_types: List[str] = []
    location: AICoachLocation = Field(default_factory=AICoachLocation)


class AICoachExtractResponse(BaseModel):
    extracted_profile: AICoachExtractedProfile
    confidence_note: str = "Mock AI Coach extraction generated for local MVP preview"

