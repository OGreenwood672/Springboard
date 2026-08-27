from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.business import Business
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.models.match import Match
from app.schemas.business import BusinessOut, BusinessUpdate
from app.schemas.application import ApplicationOut
from app.schemas.match import MatchOut
from app.core.dependencies import require_business_user, get_business
from app.core.geo import geocode_uk_postcode, create_point_geom

router = APIRouter(prefix="/businesses", tags=["Businesses"])


@router.get("/me", response_model=BusinessOut)
def get_my_business_profile(
    current_user: User = Depends(require_business_user),
    db: Session = Depends(get_db),
):
    """Get current business user's organisation profile."""
    business = db.query(Business).filter(Business.user_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile has not been created yet.",
        )
    return business


@router.patch("/me", response_model=BusinessOut)
def update_or_create_my_business_profile(
    payload: BusinessUpdate,
    current_user: User = Depends(require_business_user),
    db: Session = Depends(get_db),
):
    """Create or update current business organisation profile."""
    business = db.query(Business).filter(Business.user_id == current_user.id).first()
    is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False

    if not business:
        lat, lon = geocode_uk_postcode(payload.postcode)
        loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

        business = Business(
            user_id=current_user.id,
            name=payload.name or "My Organisation",
            organisation_type=payload.organisation_type or "Business",
            contact_name=payload.contact_name or "Manager",
            contact_email=str(payload.contact_email) if payload.contact_email else current_user.email,
            description=payload.description,
            address=payload.address,
            postcode=payload.postcode,
            website=payload.website,
            latitude=lat,
            longitude=lon,
            location_geom=loc_geom,
        )
        db.add(business)
    else:
        update_data = payload.model_dump(exclude_unset=True)

        if "postcode" in update_data:
            postcode = update_data["postcode"]
            lat, lon = geocode_uk_postcode(postcode)
            business.latitude = lat
            business.longitude = lon
            business.location_geom = create_point_geom(lat, lon, is_postgres=is_postgres)
            business.postcode = postcode

        if "name" in update_data and update_data["name"] is not None:
            business.name = update_data["name"]
        if "organisation_type" in update_data and update_data["organisation_type"] is not None:
            business.organisation_type = update_data["organisation_type"]
        if "contact_name" in update_data and update_data["contact_name"] is not None:
            business.contact_name = update_data["contact_name"]
        if "contact_email" in update_data and update_data["contact_email"] is not None:
            business.contact_email = str(update_data["contact_email"])
        if "description" in update_data:
            business.description = update_data["description"]
        if "address" in update_data:
            business.address = update_data["address"]
        if "website" in update_data:
            business.website = update_data["website"]

    db.commit()
    db.refresh(business)
    return business


@router.get("/me/opportunities/{opportunity_id}/applications", response_model=List[ApplicationOut])
def get_opportunity_applications(
    opportunity_id: UUID,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """View all candidate applications for an opportunity owned by this business."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.business_id == business.id,
    ).first()

    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or access forbidden",
        )

    apps = db.query(Application).filter(Application.opportunity_id == opportunity_id).all()
    return apps


@router.get("/me/opportunities/{opportunity_id}/matches", response_model=List[MatchOut])
def get_opportunity_matches(
    opportunity_id: UUID,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """View generated candidate matches for an opportunity owned by this business."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.business_id == business.id,
    ).first()

    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or access forbidden",
        )

    matches = db.query(Match).filter(
        Match.opportunity_id == opportunity_id
    ).order_by(Match.score.desc()).all()

    return matches

