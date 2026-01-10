from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Use a pure-Python scheme to avoid issues with bcrypt binaries in some envs
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Refresh token expiration (typically longer than access token)
REFRESH_TOKEN_EXPIRE_DAYS = 30

# =====================
# PASSWORD
# =====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# =====================
# JWT
# =====================

def create_access_token(data: dict) -> str:
    """Create an access token with short expiration"""
    to_encode = data.copy()
    # Add expiration time
    if "exp" not in to_encode:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode["exp"] = expire.timestamp()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a refresh token with longer expiration"""
    to_encode = data.copy()
    # Add expiration time (30 days)
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode["exp"] = expire.timestamp()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, verify_expiration: bool = True) -> dict:
    """
    Verify token and return payload.

    Args:
        token: JWT token to verify
        verify_expiration: If False, ignores expiration (for refresh tokens)

    Returns:
        Token payload as dict

    Raises:
        HTTPException: If token is invalid
    """
    try:
        # Decode with or without expiration verification
        if verify_expiration:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        else:
            # Decode without verifying expiration
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})

        if "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current user from access token (with expiration verification)"""
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
    roles = payload.get("roles", [])

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
