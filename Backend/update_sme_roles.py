"""
Update all SME users to have both SME and BUYER roles
This allows SME users to appear in buyer dropdown and transact with each other
"""
import sys
import os
sys.path.insert(0, '.')

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def update_sme_roles():
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./invoice_rwa.db")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Update all SME users to have both SME and BUYER roles
            result = conn.execute(text(
                "UPDATE users SET roles = 'SME,BUYER' WHERE roles LIKE '%SME%' AND roles NOT LIKE '%BUYER%'"
            ))
            conn.commit()
            
            updated_count = result.rowcount
            print(f"✅ Updated {updated_count} SME user(s) to have SME,BUYER roles")
            
            # Show current SME users
            result2 = conn.execute(text("SELECT email, roles FROM users WHERE roles LIKE '%SME%'"))
            print("\n📋 Current SME users:")
            for row in result2:
                print(f"  {row[0]}: {row[1]}")
        
    except Exception as e:
        print(f"❌ Error updating users: {e}")
        raise

if __name__ == "__main__":
    print("🔄 Updating SME users to have both SME and BUYER roles...\n")
    update_sme_roles()
    print("\n✅ Done!")
