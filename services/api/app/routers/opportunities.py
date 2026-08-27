from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User
from app.models.business import Business
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.schemas.opportunity import (
    OpportunityOut,
    OpportunityCreate,
    OpportunityUpdate,
)
from app.core.dependencies import get_optional_current_user, require_business_user, get_business
from app.core.geo import geocode_uk_postcode, create_point_geom

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


def format_opportunity_out(opp: Opportunity, db: Session) -> OpportunityOut:
    app_count = db.query(Application).filter(Application.opportunity_id == opp.id).count()
    return OpportunityOut(
        id=opp.id,
        business_id=opp.business_id,
        business_name=opp.business.name if opp.business else None,
        organisation_type=opp.business.organisation_type if opp.business else None,
        title=opp.title,
        opportunity_type=opp.opportunity_type,
        description=opp.description,
        required_skills=opp.required_skills or [],
        preferred_skills=opp.preferred_skills or [],
        location_name=opp.location_name,
        postcode=opp.postcode,
        workplace_type=opp.workplace_type,
        pay_info=opp.pay_info,
        hours_or_commitment=opp.hours_or_commitment,
        deadline=opp.deadline,
        status=opp.status,
        latitude=opp.latitude,
        longitude=opp.longitude,
        applications_count=app_count,
        created_at=opp.created_at,
        updated_at=opp.updated_at,
    )


@router.get("", response_model=List[OpportunityOut])
def list_opportunities(
    opportunity_type: Optional[str] = Query(None, description="Filter by part_time_job, work_experience, volunteering"),
    location: Optional[str] = Query(None, description="Filter by location or postcode search"),
    keyword: Optional[str] = Query(None, description="Filter by title, description, or skill keyword"),
    workplace_type: Optional[str] = Query(None, description="Filter by remote, hybrid, in_person"),
    my_business_only: Optional[bool] = Query(False, description="If true, return all opportunities owned by the authenticated business"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    List opportunities.
    For public/youth browsing, returns published opportunities matching filters.
    If my_business_only=true and authenticated as business, returns that business's opportunities (including drafts/closed).
    """
    query = db.query(Opportunity)

    if my_business_only:
        if not current_user or current_user.role != "business":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Must be logged in as business to view own listings",
            )
        business = db.query(Business).filter(Business.user_id == current_user.id).first()
        if not business:
            return []
        query = query.filter(Opportunity.business_id == business.id)
    else:
        # Public & youth only see published opportunities
        query = query.filter(Opportunity.status == "published")

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)

    if workplace_type:
        query = query.filter(Opportunity.workplace_type == workplace_type)

    if location:
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Opportunity.location_name.ilike(loc_term),
                Opportunity.postcode.ilike(loc_term),
            )
        )

    if keyword:
        kw_term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(kw_term),
                Opportunity.description.ilike(kw_term),
            )
        )

    opps = query.order_by(Opportunity.created_at.desc()).all()
    return [format_opportunity_out(opp, db) for opp in opps]


@router.get("/{id}", response_model=OpportunityOut)
def get_opportunity_by_id(
    id: UUID,
    db: Session = Depends(get_db),
):
    """Get single opportunity details by ID."""
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )
    return format_opportunity_out(opp, db)


@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    payload: OpportunityCreate,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """Create a new opportunity (Business only)."""
    is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False
    lat, lon = geocode_uk_postcode(payload.postcode)
    loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

    new_opp = Opportunity(
        business_id=business.id,
        title=payload.title,
        opportunity_type=payload.opportunity_type,
        description=payload.description,
        required_skills=payload.required_skills,
        preferred_skills=payload.preferred_skills,
        location_name=payload.location_name,
        postcode=payload.postcode,
        workplace_type=payload.workplace_type,
        pay_info=payload.pay_info,
        hours_or_commitment=payload.hours_or_commitment,
        deadline=payload.deadline,
        status=payload.status or "draft",
        latitude=lat,
        longitude=lon,
        location_geom=loc_geom,
    )
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)
    return format_opportunity_out(new_opp, db)


@router.patch("/{id}", response_model=OpportunityOut)
def update_opportunity(
    id: UUID,
    payload: OpportunityUpdate,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """Edit an opportunity owned by the current business."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == id,
        Opportunity.business_id == business.id,
    ).first()

    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or access forbidden",
        )

    is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False
    update_data = payload.model_dump(exclude_unset=True)

    if "postcode" in update_data:
        postcode = update_data["postcode"]
        lat, lon = geocode_uk_postcode(postcode)
        opp.latitude = lat
        opp.longitude = lon
        opp.location_geom = create_point_geom(lat, lon, is_postgres=is_postgres)
        opp.postcode = postcode

    if "title" in update_data and update_data["title"] is not None:
        opp.title = update_data["title"]
    if "opportunity_type" in update_data and update_data["opportunity_type"] is not None:
        opp.opportunity_type = update_data["opportunity_type"]
    if "description" in update_data and update_data["description"] is not None:
        opp.description = update_data["description"]
    if "required_skills" in update_data and update_data["required_skills"] is not None:
        opp.required_skills = update_data["required_skills"]
    if "preferred_skills" in update_data and update_data["preferred_skills"] is not None:
        opp.preferred_skills = update_data["preferred_skills"]
    if "location_name" in update_data:
        opp.location_name = update_data["location_name"]
    if "workplace_type" in update_data and update_data["workplace_type"] is not None:
        opp.workplace_type = update_data["workplace_type"]
    if "pay_info" in update_data:
        opp.pay_info = update_data["pay_info"]
    if "hours_or_commitment" in update_data:
        opp.hours_or_commitment = update_data["hours_or_commitment"]
    if "deadline" in update_data:
        opp.deadline = update_data["deadline"]
    if "status" in update_data and update_data["status"] is not None:
        opp.status = update_data["status"]

    db.commit()
    db.refresh(opp)
    return format_opportunity_out(opp, db)


@router.post("/{id}/publish", response_model=OpportunityOut)
def publish_opportunity(
    id: UUID,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """Publish an opportunity so youth users can browse and apply."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == id,
        Opportunity.business_id == business.id,
    ).first()

    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or access forbidden",
        )

    opp.status = "published"
    db.commit()
    db.refresh(opp)
    return format_opportunity_out(opp, db)


@router.post("/{id}/close", response_model=OpportunityOut)
def close_opportunity(
    id: UUID,
    business: Business = Depends(get_business),
    db: Session = Depends(get_db),
):
    """Close an opportunity to stop accepting new applications."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == id,
        Opportunity.business_id == business.id,
    ).first()

    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or access forbidden",
        )

    opp.status = "closed"
    db.commit()
    db.refresh(opp)
    return format_opportunity_out(opp, db)
