"""
Script to create a test user with approved organization for testing the verification status display
"""
import sys
import os
from datetime import datetime, timedelta

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrgStatus, OrgType
from app.core.security import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_user():
    """Create a test user with approved organization"""
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        test_email = "testuser@example.com"
        existing_user = db.query(User).filter(User.email == test_email).first()
        
        if existing_user:
            logger.info(f"Test user {test_email} already exists with ID {existing_user.id}")
            # Check if org exists
            if existing_user.organization_id:
                org = db.query(Organization).filter(Organization.id == existing_user.organization_id).first()
                if org:
                    logger.info(f"Organization: {org.legal_name}, Status: {org.status}, Verified: {org.verified_at}")
                    return existing_user, org
            
        # Create new organization first
        org = Organization(
            legal_name="CÔNG TY TNHH TEST ABC",
            trade_name="ABC Company",
            foreign_name="ABC Company Limited",
            tax_id="0123456789",
            org_type=OrgType.SME,
            status=OrgStatus.APPROVED,
            verified_at=datetime.utcnow() - timedelta(days=5),  # Verified 5 days ago
            verified_by=1,  # Assume admin user ID 1
            address="123 Test Street, Test City"
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        
        if not existing_user:
            # Create new user
            user = User(
                email=test_email,
                hashed_password=hash_password("password123"),
                roles="SME,BUYER",
                role="SME",
                organization_id=org.id
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created test user: {user.email} with ID {user.id}")
        else:
            # Update existing user
            existing_user.organization_id = org.id
            db.commit()
            user = existing_user
            logger.info(f"Updated existing user {user.email} with organization")
        
        logger.info(f"Test setup complete:")
        logger.info(f"  User: {user.email}")
        logger.info(f"  Organization: {org.legal_name}")
        logger.info(f"  Status: {org.status}")
        logger.info(f"  Verified: {org.verified_at}")
        
        return user, org
        
    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def create_expired_test_user():
    """Create a test user with expired verification (35+ days old)"""
    db = SessionLocal()
    
    try:
        test_email = "expireduser@example.com"
        existing_user = db.query(User).filter(User.email == test_email).first()
        
        if existing_user and existing_user.organization_id:
            org = db.query(Organization).filter(Organization.id == existing_user.organization_id).first()
            if org:
                logger.info(f"Expired test user already exists: {existing_user.email}")
                logger.info(f"Organization: {org.legal_name}, Verified: {org.verified_at}")
                return existing_user, org
        
        # Create organization with expired verification
        org = Organization(
            legal_name="CÔNG TY TNHH EXPIRED TEST",
            trade_name="Expired Company",
            tax_id="9876543210",
            org_type=OrgType.SME,
            status=OrgStatus.APPROVED,
            verified_at=datetime.utcnow() - timedelta(days=35),  # Verified 35 days ago - EXPIRED
            verified_by=1,
            address="456 Expired Street, Old City"
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        
        if not existing_user:
            user = User(
                email=test_email,
                hashed_password=hash_password("password123"),
                roles="SME,BUYER",
                role="SME",
                organization_id=org.id
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created expired test user: {user.email}")
        else:
            existing_user.organization_id = org.id
            db.commit()
            user = existing_user
            logger.info(f"Updated existing user with expired org")
        
        logger.info(f"Expired test setup complete:")
        logger.info(f"  User: {user.email}")
        logger.info(f"  Organization: {org.legal_name}")
        logger.info(f"  Status: {org.status}")
        logger.info(f"  Verified: {org.verified_at} (EXPIRED)")
        
        return user, org
        
    except Exception as e:
        logger.error(f"Error creating expired test user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def update_existing_users():
    """Update all existing users with organizations"""
    db = SessionLocal()
    
    try:
        # Get all users without organization
        users_without_org = db.query(User).filter(User.organization_id == None).all()
        
        logger.info(f"Found {len(users_without_org)} users without organization")
        
        updated_count = 0
        for user in users_without_org:
            # Determine org type based on user roles
            roles = user.roles.split(',') if user.roles else []
            
            if 'ADMIN' in roles:
                logger.info(f"Skipping admin user: {user.email}")
                continue
                
            org_type = OrgType.BANK if 'BANK' in roles else OrgType.SME
            
            # Create organization for this user
            org = Organization(
                legal_name=f"CÔNG TY TNHH {user.email.split('@')[0].upper()}",
                trade_name=f"{user.email.split('@')[0]} Company",
                tax_id=f"MST{user.id:010d}",  # Generate unique tax ID
                org_type=org_type,
                status=OrgStatus.APPROVED,
                verified_at=datetime.utcnow() - timedelta(days=10),  # Verified 10 days ago
                verified_by=1,
                address=f"Address for {user.email}"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            
            # Link user to organization
            user.organization_id = org.id
            db.commit()
            
            updated_count += 1
            logger.info(f"✅ Updated user {user.email} with organization {org.legal_name}")
        
        logger.info(f"Updated {updated_count} users with organizations")
        return updated_count
        
    except Exception as e:
        logger.error(f"Error updating existing users: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def list_all_users():
    """List all users and their organization status"""
    db = SessionLocal()
    
    try:
        all_users = db.query(User).all()
        
        print("\n" + "="*80)
        print("ALL USERS IN DATABASE")
        print("="*80)
        
        for user in all_users:
            org_info = "No organization"
            status_info = "Unavailable"
            
            if user.organization_id:
                org = db.query(Organization).filter(Organization.id == user.organization_id).first()
                if org:
                    org_info = f"{org.legal_name} (Status: {org.status})"
                    
                    # Check verification status
                    if org.status == OrgStatus.APPROVED and org.verified_at:
                        days_since = (datetime.utcnow() - org.verified_at).days
                        if days_since < 30:
                            status_info = f"Available ({30 - days_since} days remaining)"
                        else:
                            status_info = f"Unavailable (Expired {days_since} days ago)"
                    elif org.status == OrgStatus.PENDING:
                        status_info = "Unavailable (Pending approval)"
                    elif org.status == OrgStatus.REJECTED:
                        status_info = "Unavailable (Rejected)"
            
            print(f"\n📧 Email: {user.email}")
            print(f"   ID: {user.id}")
            print(f"   Roles: {user.roles}")
            print(f"   Organization: {org_info}")
            print(f"   Status: {status_info}")
        
        print("\n" + "="*80)
        print(f"Total users: {len(all_users)}")
        print("="*80 + "\n")
        
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage test users and organizations')
    parser.add_argument('--update-existing', action='store_true', 
                       help='Update existing users with organizations')
    parser.add_argument('--list', action='store_true', 
                       help='List all users and their status')
    parser.add_argument('--all', action='store_true',
                       help='Create test users and update existing users')
    
    args = parser.parse_args()
    
    if args.list:
        list_all_users()
    elif args.update_existing:
        print("\nUpdating existing users...")
        updated = update_existing_users()
        print(f"\n✅ Updated {updated} users")
        list_all_users()
    elif args.all:
        print("Creating test users...")
        create_test_user()
        create_expired_test_user()
        print("\nUpdating existing users...")
        updated = update_existing_users()
        print(f"\n✅ Updated {updated} existing users")
        list_all_users()
    else:
        # Default: just create test users
        print("Creating test users...")
        create_test_user()
        create_expired_test_user()
        print("Test users created successfully!")
        print("\nLogin credentials:")
        print("Active user: testuser@example.com / password123")
        print("Expired user: expireduser@example.com / password123")
        print("\nTo update existing users, run: python create_test_users.py --update-existing")
        print("To list all users, run: python create_test_users.py --list")
        print("To do everything, run: python create_test_users.py --all")