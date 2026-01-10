"""
Fix organizations that are APPROVED but missing verified_at
"""
import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.organization import Organization, OrgStatus
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_approved_orgs_without_verified_at():
    """Fix organizations that are APPROVED but missing verified_at"""
    db = SessionLocal()
    
    try:
        # Find all approved orgs without verified_at
        orgs_to_fix = db.query(Organization).filter(
            Organization.status == OrgStatus.APPROVED,
            Organization.verified_at == None
        ).all()
        
        if not orgs_to_fix:
            print("✅ No organizations need fixing")
            return 0
        
        print(f"\nFound {len(orgs_to_fix)} organizations to fix:")
        print("="*80)
        
        for org in orgs_to_fix:
            # Set verified_at to current time
            org.verified_at = datetime.utcnow() - timedelta(days=1)  # Set to 1 day ago
            org.verified_by = 1  # Assume admin ID 1
            
            print(f"✅ Fixed: {org.legal_name} (ID: {org.id})")
            print(f"   Tax ID: {org.tax_id}")
            print(f"   Verified At: {org.verified_at}")
        
        db.commit()
        
        print("="*80)
        print(f"\n✅ Fixed {len(orgs_to_fix)} organizations")
        
        return len(orgs_to_fix)
        
    except Exception as e:
        logger.error(f"Error fixing organizations: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Fixing APPROVED organizations without verified_at...")
    fixed = fix_approved_orgs_without_verified_at()
    
    if fixed > 0:
        print(f"\n🎉 Successfully fixed {fixed} organizations!")
        print("Users can now login and see 'Available' status")
    else:
        print("\nNo organizations needed fixing")
