"""
Script to fix missing sme_org_id and buyer_org_id in existing invoices
Automatically assigns organization IDs from user's organization_id
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.invoice import Invoice
from app.models.user import User

def fix_missing_org_ids():
    """Fix missing organization IDs in invoices"""
    db = SessionLocal()
    
    try:
        # Get all invoices
        invoices = db.query(Invoice).all()
        
        updated_count = 0
        
        for invoice in invoices:
            updated = False
            
            # Fix missing sme_org_id
            if not invoice.sme_org_id and invoice.sme_id:
                sme_user = db.query(User).filter(User.id == invoice.sme_id).first()
                if sme_user and sme_user.organization_id:
                    invoice.sme_org_id = sme_user.organization_id
                    print(f"✓ Invoice #{invoice.invoice_number}: Set sme_org_id = {sme_user.organization_id}")
                    updated = True
                else:
                    print(f"⚠ Invoice #{invoice.invoice_number}: SME user (ID: {invoice.sme_id}) has no organization_id")
            
            # Fix missing buyer_org_id
            if not invoice.buyer_org_id and invoice.buyer_id:
                buyer_user = db.query(User).filter(User.id == invoice.buyer_id).first()
                if buyer_user and buyer_user.organization_id:
                    invoice.buyer_org_id = buyer_user.organization_id
                    print(f"✓ Invoice #{invoice.invoice_number}: Set buyer_org_id = {buyer_user.organization_id}")
                    updated = True
                else:
                    print(f"⚠ Invoice #{invoice.invoice_number}: Buyer user (ID: {invoice.buyer_id}) has no organization_id")
            
            if updated:
                updated_count += 1
        
        # Commit all changes
        db.commit()
        print(f"\n✅ Successfully updated {updated_count} invoices")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Fixing missing organization IDs in invoices...\n")
    fix_missing_org_ids()
