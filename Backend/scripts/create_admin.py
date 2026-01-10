"""
Script to create an admin user for the InvoiceRWA system
"""
import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_admin_user(email="admin@invoicerwa.com", password="admin123"):
    """Create an admin user with specified credentials"""
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == email).first()

        if existing_admin:
            logger.info(f"Admin user {email} already exists with ID {existing_admin.id}")
            logger.info(f"Roles: {existing_admin.roles}")
            return existing_admin

        # Create new admin user
        admin_user = User(
            email=email,
            hashed_password=hash_password(password),
            roles="ADMIN",
            role="ADMIN",
            organization_id=None  # Admins don't need an organization
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        logger.info(f"Admin user created successfully!")
        logger.info(f"  Email: {admin_user.email}")
        logger.info(f"  ID: {admin_user.id}")
        logger.info(f"  Roles: {admin_user.roles}")
        logger.info(f"  Password: {password}")

        return admin_user

    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def list_admin_users():
    """List all admin users in the database"""
    db = SessionLocal()

    try:
        admins = db.query(User).filter(User.roles.like("%ADMIN%")).all()

        print("\n" + "="*80)
        print("ADMIN USERS")
        print("="*80)

        if not admins:
            print("No admin users found.")
        else:
            for admin in admins:
                print(f"\nID: {admin.id}")
                print(f"Email: {admin.email}")
                print(f"Roles: {admin.roles}")

        print("\n" + "="*80 + "\n")
        return admins

    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Create admin user')
    parser.add_argument('--email', default='admin@invoicerwa.com',
                       help='Admin email (default: admin@invoicerwa.com)')
    parser.add_argument('--password', default='admin123',
                       help='Admin password (default: admin123)')
    parser.add_argument('--list', action='store_true',
                       help='List all admin users')

    args = parser.parse_args()

    if args.list:
        list_admin_users()
    else:
        print("Creating admin user...")
        admin = create_admin_user(args.email, args.password)
        print(f"\nAdmin user created: {admin.email}")
        print(f"Login with: {admin.email} / {args.password}")
