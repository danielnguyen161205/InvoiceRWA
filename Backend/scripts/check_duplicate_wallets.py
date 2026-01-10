"""
Check for duplicate wallet addresses in organizations
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.organization import Organization

def check_duplicate_wallets():
    """Check for duplicate wallet addresses"""
    db = SessionLocal()
    
    try:
        # Get all organizations with wallet addresses
        orgs = db.query(Organization).filter(Organization.wallet_address.isnot(None)).all()
        
        print(f"📊 Found {len(orgs)} organizations with wallet addresses\n")
        
        # Track wallet addresses
        wallet_map = {}
        duplicates = []
        
        for org in orgs:
            wallet = org.wallet_address.lower() if org.wallet_address else None
            if wallet:
                if wallet in wallet_map:
                    duplicates.append({
                        'wallet': wallet,
                        'orgs': [wallet_map[wallet], org]
                    })
                    print(f"⚠️  DUPLICATE WALLET FOUND: {wallet}")
                    print(f"   Organization 1: ID={wallet_map[wallet].id}, Name={wallet_map[wallet].legal_name}")
                    print(f"   Organization 2: ID={org.id}, Name={org.legal_name}\n")
                else:
                    wallet_map[wallet] = org
        
        if not duplicates:
            print("✅ No duplicate wallet addresses found!")
        else:
            print(f"\n⚠️  Total duplicates: {len(duplicates)}")
            print("\n💡 Solution: Each organization must have a unique wallet address.")
            print("   Please update the wallet addresses in the duplicate organizations.")
        
        # Show all wallets
        print("\n📋 All wallet addresses:")
        for org in orgs:
            print(f"   Org #{org.id:2d} ({org.legal_name:30s}): {org.wallet_address}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Checking for duplicate wallet addresses...\n")
    check_duplicate_wallets()
