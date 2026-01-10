from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import List

from app.core.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Use a pure-Python scheme to avoid issues with bcrypt binaries in some envs
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# =====================
# PASSWORD
# =====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(password, hashed)
    except Exception:
        # Return constant-time False to prevent timing attacks
        return False

# =====================
# JWT
# =====================

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_admin_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Get current user and ensure they have admin role
    """
    payload = get_current_user(token)
    roles = get_user_roles(payload)

    if "ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")

    return payload


def get_current_user_from_db(db, token: str = Depends(oauth2_scheme)):
    """
    Get current user object from database
    """
    from app.models.user import User

    payload = get_current_user(token)
    user_id = int(payload["sub"])

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# =====================
# ROLE HELPERS
# =====================

def get_user_roles(user: dict) -> List[str]:
    """
    Extract roles from user dict in a consistent manner.
    Handles both list and string formats, with fallback to role field.
    Strips whitespace from roles for consistency.
    """
    roles = user.get("roles")
    if isinstance(roles, list):
        return [r.strip() if isinstance(r, str) else r for r in roles if r]
    if isinstance(roles, str):
        return [r.strip() for r in roles.split(',') if r.strip()]
    # Fallback to legacy role field
    if user.get("role"):
        return [user.get("role").strip()]
    return []
