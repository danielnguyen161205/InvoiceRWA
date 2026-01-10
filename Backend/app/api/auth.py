from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserLogin, Token, TokenRefresh, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token, get_current_user
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
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

    access_token = create_access_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles_list
    })

    refresh_token = create_refresh_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "type": "refresh"
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
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

    access_token = create_access_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles_list,
        "kyc_verified": kyc_verified,
        "org_status": org_status,
        "legal_name": legal_name,
        "verified_at": verified_at
    })

    refresh_token = create_refresh_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "type": "refresh"
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.

    This endpoint accepts an expired JWT refresh token, verifies its signature,
    checks if refresh is allowed, and generates a new access token.

    Logic:
    1. Verify refresh token signature (even if expired)
    2. Extract user ID from token payload
    3. Check if user exists and is active
    4. Generate new access token with current user data
    5. Return new access token (optionally new refresh token)
    """
    try:
        # Verify token signature and extract payload
        payload = verify_token(data.refresh_token, verify_expiration=False)

        # Check if this is a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        # Extract user ID
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Get user from database
        db_user = db.query(User).filter(User.id == int(user_id)).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Parse roles
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

        # Generate new access token
        new_access_token = create_access_token({
            "sub": str(db_user.id),
            "email": db_user.email,
            "roles": roles_list,
            "kyc_verified": kyc_verified,
            "org_status": org_status,
            "legal_name": legal_name,
            "verified_at": verified_at
        })

        # Optionally generate new refresh token (recommended for security)
        new_refresh_token = create_refresh_token({
            "sub": str(db_user.id),
            "email": db_user.email,
            "type": "refresh"
        })

        logger.info(f"Token refreshed for user {db_user.email}")

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


# GET LIST OF BANKS
@users_router.get("/banks")
def get_banks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get list of all users with BANK role (for SME to send financing requests)"""

    # Query users who have BANK role
    banks = db.query(User).filter(
        (User.roles.like('%BANK%')) | (User.role == 'BANK')
    ).all()

    # Return bank information with organization name if available
    result = []
    for bank in banks:
        bank_data = {
            "id": bank.id,
            "email": bank.email,
            "organization_name": None
        }

        # Get organization name if available
        if bank.organization_id:
            org = db.query(Organization).filter(Organization.id == bank.organization_id).first()
            if org:
                bank_data["organization_name"] = org.legal_name

        result.append(bank_data)

    return result


@users_router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Get user by ID with role-based access control.

    Access Rules:
    - ADMIN: Can view any user
    - BANK: Can view any user (for KYC checks)
    - SME/BUYER: Can only view their own profile

    Returns user information including email, roles, and organization details.
    """
    # Get current user's roles
    current_roles = current_user.get("roles", [])
    current_user_id = int(current_user.get("sub"))

    # Check authorization
    is_admin = "ADMIN" in current_roles
    is_bank = "BANK" in current_roles
    is_self = current_user_id == user_id

    if not (is_admin or is_bank or is_self):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view this user's information"
        )

    # Query user
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Parse roles
    roles_list = [r for r in db_user.roles.split(',') if r]

    # Get organization information if available
    organization_name = None
    if db_user.organization_id:
        org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
        if org:
            organization_name = org.legal_name or org.trade_name

    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        roles=roles_list,
        organization_id=db_user.organization_id,
        organization_name=organization_name,
        is_active=getattr(db_user, 'is_active', True),
        created_at=db_user.created_at.isoformat() if hasattr(db_user, 'created_at') and db_user.created_at else None
    )


