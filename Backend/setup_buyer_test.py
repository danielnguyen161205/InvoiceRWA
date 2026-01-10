"""
Setup buyer role for sme@example.com and create test invoice for buyer to submit
"""
from app.db.session import SessionLocal
from app.models.user import User
from app.models.invoice import Invoice

db = SessionLocal()

try:
    # Step 1: Find sme@example.com user
    user = db.query(User).filter(User.email == "sme@example.com").first()
    if not user:
        print("❌ User sme@example.com not found!")
        exit(1)
    
    print(f"✓ Found user: {user.email} (ID: {user.id})")
    print(f"  Current roles: {user.roles}")
    
    # Step 2: Add BUYER role if not exists
    current_roles = user.roles.split(",") if user.roles else []
    if "BUYER" not in current_roles:
        current_roles.append("BUYER")
        user.roles = ",".join(current_roles)
        db.commit()
        print(f"✓ Updated roles to: {user.roles}")
    else:
        print(f"✓ BUYER role already exists")
    
    # Step 3: Create invoice where this user is the buyer (status DRAFT)
    # We'll create it as if another SME created it
    invoice = Invoice(
        invoice_number="INV-BUYER-TEST-001",
        amount=12000.0,
        buyer_name=user.email,
        sme_id=2,  # Different SME (assuming another user exists)
        buyer_id=user.id,  # THIS user is the buyer
        status="DRAFT"
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    print(f"\n✅ SUCCESS! Created test invoice:")
    print(f"  Invoice ID: {invoice.id}")
    print(f"  Invoice Number: {invoice.invoice_number}")
    print(f"  Amount: ${invoice.amount}")
    print(f"  Status: {invoice.status}")
    print(f"  Buyer ID: {invoice.buyer_id} (sme@example.com)")
    print(f"  SME ID: {invoice.sme_id}")
    
    print(f"\n📊 Now login as sme@example.com / Password123!")
    print(f"   Switch to 'To Pay' tab and you should see this invoice")
    print(f"   Click 'View' then 'Submit Invoice' button will appear!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
