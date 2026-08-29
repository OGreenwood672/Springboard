from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.youth_profile import YouthProfile
from app.models.youth_qualification import YouthQualification
from app.schemas.youth_profile import (
    YouthProfileOut,
    YouthProfileUpdate,
    YouthProfileCreate,
)
from app.schemas.knowledge_graph import KnowledgeGraphOut
from app.services.knowledge_graph_service import build_knowledge_graph
from app.core.dependencies import require_youth_user
from app.core.geo import geocode_uk_postcode, create_point_geom

router = APIRouter(prefix="/profiles", tags=["Youth Profiles"])


@router.get("/me/knowledge-graph", response_model=KnowledgeGraphOut)
def get_my_knowledge_graph(
    current_user: User = Depends(require_youth_user),
    db: Session = Depends(get_db),
):
    """Build an explainable skills graph from the profile and published roles."""
    profile = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Youth profile has not been created yet.",
        )
    return build_knowledge_graph(db, profile)


@router.get("/me", response_model=YouthProfileOut)
def get_my_youth_profile(
    current_user: User = Depends(require_youth_user),
    db: Session = Depends(get_db),
):
    """Get the current youth user's profile."""
    profile = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Youth profile has not been created yet.",
        )
    return profile


@router.patch("/me", response_model=YouthProfileOut)
def update_or_create_my_youth_profile(
    payload: YouthProfileUpdate,
    current_user: User = Depends(require_youth_user),
    db: Session = Depends(get_db),
):
    """Create or update the current youth user's profile."""
    profile = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
    is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False

    if not profile:
        # Create new profile
        lat, lon = geocode_uk_postcode(payload.postcode)
        loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

        profile = YouthProfile(
            user_id=current_user.id,
            full_name=payload.full_name or "Youth Member",
            preferred_location=payload.preferred_location,
            postcode=payload.postcode,
            max_travel_km=payload.max_travel_km if payload.max_travel_km is not None else 15,
            latitude=lat,
            longitude=lon,
            location_geom=loc_geom,
            skills=payload.skills or [],
            interests=payload.interests or [],
            availability=payload.availability.model_dump() if payload.availability else {},
            education_stage=payload.education_stage,
            bio=payload.bio,
            preferred_opportunity_types=payload.preferred_opportunity_types or [],
        )
        db.add(profile)
        db.flush()
    else:
        # Update existing profile
        update_data = payload.model_dump(exclude_unset=True)

        if "postcode" in update_data:
            postcode = update_data["postcode"]
            lat, lon = geocode_uk_postcode(postcode)
            profile.latitude = lat
            profile.longitude = lon
            profile.location_geom = create_point_geom(lat, lon, is_postgres=is_postgres)
            profile.postcode = postcode

        if "full_name" in update_data and update_data["full_name"] is not None:
            profile.full_name = update_data["full_name"]
        if "preferred_location" in update_data:
            profile.preferred_location = update_data["preferred_location"]
        if "max_travel_km" in update_data and update_data["max_travel_km"] is not None:
            profile.max_travel_km = update_data["max_travel_km"]
        if "skills" in update_data and update_data["skills"] is not None:
            profile.skills = update_data["skills"]
        if "interests" in update_data and update_data["interests"] is not None:
            profile.interests = update_data["interests"]
        if "availability" in update_data and update_data["availability"] is not None:
            profile.availability = payload.availability.model_dump() if payload.availability else {}
        if "education_stage" in update_data:
            profile.education_stage = update_data["education_stage"]
        if "bio" in update_data:
            profile.bio = update_data["bio"]
        if "preferred_opportunity_types" in update_data and update_data["preferred_opportunity_types"] is not None:
            profile.preferred_opportunity_types = update_data["preferred_opportunity_types"]

    # Handle qualifications update if provided
    if payload.qualifications is not None:
        # Clear existing qualifications
        db.query(YouthQualification).filter(
            YouthQualification.youth_profile_id == profile.id
        ).delete()

        # Add new qualifications
        for q in payload.qualifications:
            new_q = YouthQualification(
                youth_profile_id=profile.id,
                qualification_id=q.qualification_id,
                name=q.name,
                grade=q.grade,
                year_obtained=q.year_obtained,
            )
            db.add(new_q)

    db.commit()
    db.refresh(profile)
    return profile
