"""
Script to update buyer organization information for all SME and BUYER users
Ensures all users with SME or BUYER roles have their organization_id properly set
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrgType, OrgStatus

def update_buyer_organizations():
    """Update organization IDs for SME and BUYER users"""
    db = SessionLocal()
    
    try:
        print("🔄 Starting buyer organization update...")
        print("=" * 60)
        
        # Get all organizations
        all_orgs = db.query(Organization).all()
        print(f"\n📊 Total organizations in database: {len(all_orgs)}")
        
        # Count organizations by type
        sme_orgs = db.query(Organization).filter(Organization.org_type == OrgType.SME).all()
        buyer_orgs = db.query(Organization).filter(Organization.org_type == OrgType.BUYER).all()
        bank_orgs = db.query(Organization).filter(Organization.org_type == OrgType.BANK).all()
        
        print(f"  - SME Organizations: {len(sme_orgs)}")
        print(f"  - BUYER Organizations: {len(buyer_orgs)}")
        print(f"  - BANK Organizations: {len(bank_orgs)}")
        
        # Get all users with SME or BUYER roles
        all_users = db.query(User).all()
        print(f"\n👥 Total users in database: {len(all_users)}")
        
        sme_buyer_users = []
        for user in all_users:
            roles = user.roles.split(',') if user.roles else []
            if 'SME' in roles or 'BUYER' in roles:
                sme_buyer_users.append(user)
        
        print(f"  - Users with SME/BUYER role: {len(sme_buyer_users)}")
        
        # Update users without organization_id
        updated_count = 0
        already_set_count = 0
        no_match_count = 0
        
        print("\n🔧 Updating user organization links...")
        print("-" * 60)
        
        for user in sme_buyer_users:
            roles = user.roles.split(',') if user.roles else []
            
            if user.organization_id:
                org = db.query(Organization).filter(Organization.id == user.organization_id).first()
                print(f"  ✓ User {user.email} already linked to org: {org.legal_name if org else 'Unknown'}")
                already_set_count += 1
                continue
            
            # Try to find matching organization by email domain or tax_id
            email_domain = user.email.split('@')[1] if '@' in user.email else None
            
            # First try: Find organization by email in legal_name or trade_name
            matched_org = None
            
            if email_domain:
                # Try to match by domain
                for org in all_orgs:
                    if email_domain.lower() in (org.legal_name or '').lower():
                        matched_org = org
                        break
            
            # If no match, try to find first approved SME/BUYER organization
            if not matched_org:
                if 'SME' in roles:
                    matched_org = db.query(Organization).filter(
                        Organization.org_type == OrgType.SME,
                        Organization.status == OrgStatus.APPROVED
                    ).first()
                elif 'BUYER' in roles:
                    matched_org = db.query(Organization).filter(
                        Organization.org_type == OrgType.BUYER,
                        Organization.status == OrgStatus.APPROVED
                    ).first()
            
            if matched_org:
                user.organization_id = matched_org.id
                db.commit()
                print(f"  ✅ Linked {user.email} to {matched_org.legal_name} (ID: {matched_org.id})")
                updated_count += 1
            else:
                print(f"  ⚠️  No matching organization found for {user.email}")
                no_match_count += 1
        
        print("\n" + "=" * 60)
        print("📈 Update Summary:")
        print(f"  - Updated: {updated_count} users")
        print(f"  - Already set: {already_set_count} users")
        print(f"  - No match: {no_match_count} users")
        print(f"  - Total processed: {len(sme_buyer_users)} users")
        print("=" * 60)
        
        # Display final organization statistics
        print("\n📊 Organization Statistics:")
        print("-" * 60)
        
        for org in all_orgs[:10]:  # Show first 10 orgs
            user_count = db.query(User).filter(User.organization_id == org.id).count()
            status_icon = "✓" if org.status == OrgStatus.APPROVED else "⏳" if org.status == OrgStatus.PENDING else "❌"
            org_name = (org.legal_name or 'N/A')[:40]
            org_type_str = str(org.org_type) if org.org_type else 'N/A'
            print(f"  {status_icon} {org_name:40} | Type: {org_type_str:6} | Users: {user_count}")
        
        if len(all_orgs) > 10:
            print(f"  ... and {len(all_orgs) - 10} more organizations")
        
        print("\n✅ Buyer organization update completed!")
        
    except Exception as e:
        print(f"\n❌ Error updating buyer organizations: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_buyer_organizations()
