from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.verification_service import VerificationService
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from typing import Dict

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
    
    # Count organizations expiring soon (within 7 days)
    seven_days_from_now = datetime.utcnow() - timedelta(days=23)  # 30-7=23 days ago
    expiring_soon = db.query(Organization).filter(
        Organization.status == OrgStatus.APPROVED,
        Organization.verified_at < seven_days_from_now,
        Organization.verified_at >= datetime.utcnow() - timedelta(days=30)
    ).count()
    
    # Count already expired
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
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