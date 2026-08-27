from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, YouthProfile, Business
from app.schemas.auth import UserRegister, UserLogin, AuthResponse, UserOut
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new youth or business account."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.flush()

    if user.role == "youth":
        youth_profile = YouthProfile(
            user_id=user.id,
            full_name=payload.email.split("@")[0].replace(".", " ").title(),
            skills=[],
            interests=[],
            availability={},
            preferred_opportunity_types=[],
        )
        db.add(youth_profile)
    elif user.role == "business":
        business = Business(
            user_id=user.id,
            name=payload.email.split("@")[0].replace(".", " ").title() + " Org",
            organisation_type="Technology",
            contact_name="Lead Contact",
            contact_email=payload.email,
        )
        db.add(business)

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id), role=user.role)
    return AuthResponse(access_token=token, token_type="bearer", user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and issue JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=str(user.id), role=user.role)
    return AuthResponse(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve authenticated user details."""
    return current_user
