from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.youth_profile import YouthProfile
from app.models.match import Match
from app.schemas.match import MatchOut, MatchGenerateResponse
from app.core.dependencies import get_current_user, require_youth_user, get_youth_profile
from app.services.matching_service import generate_matches_for_youth

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.post("/generate/{youth_profile_id}", response_model=MatchGenerateResponse)
def generate_matches_endpoint(
    youth_profile_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate or refresh algorithmic matches for a youth profile."""
    # RBAC: Youth can only generate for their own profile, business or admin can trigger
    if current_user.role == "youth":
        youth = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
        if not youth or youth.id != youth_profile_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You cannot generate matches for another youth's profile.",
            )

    matches = generate_matches_for_youth(db, youth_profile_id)

    return MatchGenerateResponse(
        message="Matches generated successfully",
        generated_count=len(matches),
        matches=matches,
    )


@router.get("/me", response_model=List[MatchOut])
def get_my_matches(
    youth: YouthProfile = Depends(get_youth_profile),
    db: Session = Depends(get_db),
):
    """Get all opportunities matched for the currently authenticated youth user."""
    matches = db.query(Match).filter(
        Match.youth_profile_id == youth.id
    ).order_by(Match.score.desc()).all()

    # If no matches exist yet, auto-generate them
    if not matches:
        matches = generate_matches_for_youth(db, youth.id)

    return matches

