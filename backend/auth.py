from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import get_db
from .security import verify_password

# --- Security Settings --- #

SECRET_KEY = "your-super-secret-key-that-is-long-and-random"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- OAuth2 Scheme --- #

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- JWT Token Handling --- #

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- User Dependency --- #

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> 'models.staff.Staff':
    """Decodes JWT token to get current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_staff_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def has_permission(required_permission: str):
    """FastAPI dependency to check if the current user has the required permission."""
    def permission_checker(current_user: models.staff.Staff = Depends(get_current_user), db: Session = Depends(get_db)) -> bool:
        # The user's role is accessed via the relationship
        user_role = current_user.role
        if not user_role:
            raise HTTPException(status_code=403, detail="User has no assigned role.")

        # Check if any permission for this role matches the required one
        has_perm = any(
            link.permission.name == required_permission
            for link in user_role.permissions
        )

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have the '{required_permission}' permission."
            )
        return True
    return permission_checker

