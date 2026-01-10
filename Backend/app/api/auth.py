from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token
import time
from collections import defaultdict
from typing import Dict

router = APIRouter(prefix="/auth", tags=["auth"])

# =====================
# RATE LIMITING
# =====================
# Simple in-memory rate limiter for authentication endpoints
# In production, use Redis or a dedicated rate limiting service

class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)

    def is_allowed(self, identifier: str) -> bool:
        """Check if the identifier is within the rate limit"""
        now = time.time()
        # Clean old requests outside the time window
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.window_seconds
        ]

        if len(self.requests[identifier]) >= self.max_requests:
            return False

        self.requests[identifier].append(now)
        return True

    def get_retry_after(self, identifier: str) -> int:
        """Get seconds until next request is allowed"""
        if not self.requests[identifier]:
            return 0
        oldest_request = min(self.requests[identifier])
        retry_after = int(self.window_seconds - (time.time() - oldest_request))
        return max(0, retry_after)

# Rate limiters for auth endpoints (5 requests per minute per IP)
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)
register_rate_limiter = RateLimiter(max_requests=3, window_seconds=60)


@router.post("/register", response_model=Token)
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Rate limiting based on client IP
    client_ip = request.client.host if request.client else "unknown"
    if not register_rate_limiter.is_allowed(client_ip):
        retry_after = register_rate_limiter.get_retry_after(client_ip)
        raise HTTPException(
            status_code=429,
            detail=f"Too many registration attempts. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)
    # normalize incoming role(s) to comma-separated string
    roles_in = user.role
    if roles_in is None:
        roles_list = ["SME", "BUYER"]  # Default: SME can also act as BUYER
    elif isinstance(roles_in, list):
        roles_list = roles_in
    else:
        roles_list = [roles_in]
    
    # Auto-add BUYER role to SME users
    if "SME" in roles_list and "BUYER" not in roles_list:
        roles_list.append("BUYER")

    roles_str = ",".join(roles_list)

    # set legacy `role` column to the first role for compatibility
    db_user = User(email=user.email, hashed_password=hashed, roles=roles_str, role=roles_list[0])
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles_list
    })
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Rate limiting based on client IP
    client_ip = request.client.host if request.client else "unknown"
    if not login_rate_limiter.is_allowed(client_ip):
        retry_after = login_rate_limiter.get_retry_after(client_ip)
        raise HTTPException(
            status_code=429,
            detail=f"Too many login attempts. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # parse stored roles string to list
    roles_list = [r for r in db_user.roles.split(',') if r]

    # Check KYC status
    kyc_verified = False
    org_status = None
    legal_name = None
    verified_at = None
    if db_user.organization_id:
        org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
        if org:
            org_status = org.status
            legal_name = org.legal_name
            verified_at = org.verified_at.isoformat() if org.verified_at else None
            kyc_verified = (org.status == "APPROVED")

    token = create_access_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles_list,
        "kyc_verified": kyc_verified,
        "org_status": org_status,
        "legal_name": legal_name,
        "verified_at": verified_at
    })
    return {"access_token": token, "token_type": "bearer"}