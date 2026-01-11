"""
Check user status and organization details
"""
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_user(email):
    """Check specific user's status"""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User {email} not found")
            return
        
        print("\n" + "="*80)
        print(f"USER: {email}")
        print("="*80)
        print(f"ID: {user.id}")
        print(f"Roles: {user.roles}")
        print(f"Organization ID: {user.organization_id}")
        
        if user.organization_id:
            org = db.query(Organization).filter(Organization.id == user.organization_id).first()
            if org:
                print("\nORGANIZATION:")
                print(f"  Legal Name: {org.legal_name}")
                print(f"  Tax ID: {org.tax_id}")
                print(f"  Type: {org.org_type}")
                print(f"  Status: {org.status}")
                print(f"  Verified At: {org.verified_at}")
                print(f"  Verified By: {org.verified_by}")
                
                # Calculate status
                if org.status == "APPROVED" and org.verified_at:
                    days_since = (datetime.utcnow() - org.verified_at).days
                    if days_since < 30:
                        status = f"✅ Available ({30 - days_since} days remaining)"
                    else:
                        status = f"⚠️ Unavailable (Expired {days_since} days ago)"
                elif org.status == "PENDING":
                    status = "⏳ Unavailable (Pending approval)"
                elif org.status == "REJECTED":
                    status = "❌ Unavailable (Rejected)"
                else:
                    status = "❓ Unavailable (Unknown status)"
                
                print(f"\nUSER STATUS: {status}")
                
                # Show what will be in JWT token
                print("\nJWT TOKEN WILL CONTAIN:")
                print(f"  kyc_verified: {org.status == 'APPROVED'}")
                print(f"  org_status: {org.status}")
                print(f"  legal_name: {org.legal_name}")
                print(f"  verified_at: {org.verified_at.isoformat() if org.verified_at else None}")
            else:
                print("❌ Organization not found")
        else:
            print("❌ No organization linked")
            print("\nUSER STATUS: ❌ Unavailable (No organization)")
        
        print("="*80 + "\n")
        
    except Exception as e:
        logger.error(f"Error checking user: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Check user status')
    parser.add_argument('email', help='User email to check')
    
    args = parser.parse_args()
    
    check_user(args.email)
