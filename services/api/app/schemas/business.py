from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


class BusinessBase(BaseModel):
    name: str
    organisation_type: str
    contact_name: str
    contact_email: EmailStr
    description: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    website: Optional[str] = None

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    organisation_type: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    description: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    website: Optional[str] = None

    @field_validator("postcode", mode="before")
    @classmethod
    def normalize_postcode(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class BusinessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    organisation_type: str
    contact_name: str
    contact_email: str
    description: Optional[str] = None
    address: Optional[str] = None
    postcode: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

