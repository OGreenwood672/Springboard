from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.youth_profile import YouthProfile
from app.models.business import Business
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdateStatus,
    ApplicationOut,
)
from app.core.dependencies import (
    get_current_user,
    require_youth_user,
    get_youth_profile,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_application(
    payload: ApplicationCreate,
    youth: YouthProfile = Depends(get_youth_profile),
    db: Session = Depends(get_db),
):
    """Submit an application to an opportunity (Youth only)."""
    opp = db.query(Opportunity).filter(Opportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    if opp.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot apply to an opportunity that is not currently published",
        )

    # Check for existing application
    existing_app = db.query(Application).filter(
        Application.youth_profile_id == youth.id,
        Application.opportunity_id == opp.id,
    ).first()

    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this opportunity.",
        )

    new_app = Application(
        youth_profile_id=youth.id,
        opportunity_id=opp.id,
        status="submitted",
        cover_note=payload.cover_note,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.get("/me", response_model=List[ApplicationOut])
def get_my_applications(
    youth: YouthProfile = Depends(get_youth_profile),
    db: Session = Depends(get_db),
):
    """List all applications submitted by the current youth user."""
    apps = db.query(Application).filter(
        Application.youth_profile_id == youth.id
    ).order_by(Application.created_at.desc()).all()
    return apps


@router.patch("/{id}", response_model=ApplicationOut)
def update_application_status(
    id: UUID,
    payload: ApplicationUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update application status (Business owner or Youth withdrawing)."""
    app_record = db.query(Application).filter(Application.id == id).first()
    if not app_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if current_user.role == "business":
        biz = db.query(Business).filter(Business.user_id == current_user.id).first()
        if not biz or app_record.opportunity.business_id != biz.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You do not own this opportunity listing",
            )
        app_record.status = payload.status
    elif current_user.role == "youth":
        youth = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
        if not youth or app_record.youth_profile_id != youth.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: Not your application",
            )
        if payload.status != "withdrawn":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Youth users may only change status to 'withdrawn'",
            )
        app_record.status = "withdrawn"
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized",
        )

    db.commit()
    db.refresh(app_record)
    return app_record

