import uuid
from typing import Optional, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.youth_profile import YouthProfile
from app.models.business import Business
from app.models.council import Council

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate bearer JWT token and return current User model."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retrieve User if bearer token provided, otherwise return None."""
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = uuid.UUID(user_id_str)
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def require_role(required_role: str) -> Callable:
    """Factory dependency ensuring current user has a specific role."""
    def _role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: {required_role.capitalize()} account required",
            )
        return current_user
    return _role_checker


def require_youth_user(
    current_user: User = Depends(require_role("youth")),
) -> User:
    """Ensure current user has the 'youth' role."""
    return current_user


def require_business_user(
    current_user: User = Depends(require_role("business")),
) -> User:
    """Ensure current user has the 'business' role."""
    return current_user


def require_council_user(
    current_user: User = Depends(require_role("council")),
) -> User:
    """Ensure current user has the 'council' role."""
    return current_user


def get_youth_profile(
    current_user: User = Depends(require_youth_user),
    db: Session = Depends(get_db),
) -> YouthProfile:
    """Retrieve the YouthProfile belonging to the authenticated youth user."""
    profile = db.query(YouthProfile).filter(YouthProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Youth profile not found. Please complete profile onboarding.",
        )
    return profile


def get_business(
    current_user: User = Depends(require_business_user),
    db: Session = Depends(get_db),
) -> Business:
    """Retrieve the Business belonging to the authenticated business user."""
    business = db.query(Business).filter(Business.user_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business organisation profile not found. Please complete business onboarding.",
        )
    return business


def get_council(
    current_user: User = Depends(require_council_user),
    db: Session = Depends(get_db),
) -> Council:
    """Retrieve the Council belonging to the authenticated council user."""
    council = db.query(Council).filter(Council.user_id == current_user.id).first()
    if not council:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Council profile not found. Please complete council setup.",
        )
    return council
