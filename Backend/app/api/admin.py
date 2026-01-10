from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.verification_service import VerificationService
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from typing import Dict
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/check-expired-verifications")
def check_expired_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, int]:
    """
    Admin endpoint to check and reset expired organization verifications
    Organizations with verification older than 30 days will be reset to PENDING status
    """
    reset_count = VerificationService.check_expired_verifications(db)
    
    return {
        "message": f"Checked and reset {reset_count} expired verifications",
        "reset_count": reset_count
    }


@router.get("/verification-stats")
def get_verification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get statistics about verification status
    """
    from app.models.organization import Organization, OrgStatus
    from datetime import datetime, timedelta
    
    # Count organizations by status
    total_orgs = db.query(Organization).count()
    pending_orgs = db.query(Organization).filter(Organization.status == OrgStatus.PENDING).count()
    approved_orgs = db.query(Organization).filter(Organization.status == OrgStatus.APPROVED).count()
    rejected_orgs = db.query(Organization).filter(Organization.status == OrgStatus.REJECTED).count()
    
    # Count organizations expiring soon (within 7 days from now)
    # Organizations verified between 23-30 days ago will expire in the next 7 days
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    twenty_three_days_ago = now - timedelta(days=23)
    expiring_soon = db.query(Organization).filter(
        Organization.status == OrgStatus.APPROVED,
        Organization.verified_at >= twenty_three_days_ago,
        Organization.verified_at <= thirty_days_ago
    ).count()

    # Count already expired
    expired_orgs = db.query(Organization).filter(
        Organization.status == OrgStatus.APPROVED,
        Organization.verified_at < thirty_days_ago
    ).count()
    
    return {
        "total_organizations": total_orgs,
        "pending": pending_orgs,
        "approved": approved_orgs,
        "rejected": rejected_orgs,
        "expiring_soon": expiring_soon,
        "expired": expired_orgs
    }