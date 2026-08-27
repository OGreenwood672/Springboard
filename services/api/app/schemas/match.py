from uuid import UUID
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.opportunity import OpportunityOut
from app.schemas.youth_profile import YouthProfileOut


class MatchScoreFactorsOut(BaseModel):
    total_score: float
    type_score: float
    skills_score: float
    location_score: float
    availability_score: float
    qualification_score: Optional[float] = 0.0
    distance_km: Optional[float] = None
    matched_skills: List[str] = []
    missing_skills: List[str] = []


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    youth_profile_id: UUID
    opportunity_id: UUID
    score: float
    factors: Dict[str, Any]
    opportunity: Optional[OpportunityOut] = None
    youth_profile: Optional[YouthProfileOut] = None
    created_at: datetime
    updated_at: datetime


class MatchGenerateResponse(BaseModel):
    message: str
    generated_count: int
    matches: List[MatchOut]

