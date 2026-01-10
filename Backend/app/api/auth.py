from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


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

    token = create_access_token({
        "sub": str(db_user.id),
        "email": db_user.email,
        "roles": roles_list
    })
    return {"access_token": token, "token_type": "bearer"}


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