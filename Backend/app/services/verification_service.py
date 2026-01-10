from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.organization import Organization, OrgStatus
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class VerificationService:
    @staticmethod
    def check_expired_verifications(db: Session):
        """
        Check for organizations that have been verified for more than 30 days
        and reset their status to PENDING, requiring re-verification
        """
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Find all approved organizations that were verified more than 30 days ago
        expired_orgs = db.query(Organization).filter(
            Organization.status == OrgStatus.APPROVED,
            Organization.verified_at < thirty_days_ago
        ).all()
        
        reset_count = 0
        for org in expired_orgs:
            # Reset organization status to PENDING
            org.status = OrgStatus.PENDING
            org.verified_at = None
            org.verified_by = None
            reset_count += 1
            
            logger.info(f"Reset verification status for organization {org.id} ({org.legal_name})")
        
        if reset_count > 0:
            db.commit()
            logger.info(f"Reset {reset_count} expired organization verifications")
        
        return reset_count
    
    @staticmethod
    def get_days_until_expiration(verified_at: datetime) -> int:
        """
        Calculate days remaining until verification expires
        """
        if not verified_at:
            return 0
            
        expiry_date = verified_at + timedelta(days=30)
        days_remaining = (expiry_date - datetime.now(timezone.utc)).days
        return max(0, days_remaining)
    
    @staticmethod
    def is_verification_expired(verified_at: datetime) -> bool:
        """
        Check if verification has expired (more than 30 days)
        """
        if not verified_at:
            return True
            
        days_since_verification = (datetime.now(timezone.utc) - verified_at).days
        return days_since_verification >= 30