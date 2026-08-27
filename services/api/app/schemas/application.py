from uuid import UUID
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.opportunity import OpportunityOut
from app.schemas.youth_profile import YouthProfileOut


class ApplicationCreate(BaseModel):
    opportunity_id: UUID
    cover_note: Optional[str] = None


class ApplicationUpdateStatus(BaseModel):
    status: Literal["submitted", "reviewed", "shortlisted", "rejected", "accepted", "withdrawn"]


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    youth_profile_id: UUID
    opportunity_id: UUID
    status: str
    cover_note: Optional[str] = None
    opportunity: Optional[OpportunityOut] = None
    youth_profile: Optional[YouthProfileOut] = None
    created_at: datetime
    updated_at: datetime

