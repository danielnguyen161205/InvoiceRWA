"""
Update buyer_id cho invoice vừa tạo
"""
from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    # Get latest invoice
    result = db.execute(text("SELECT id, invoice_number, status FROM invoices ORDER BY id DESC LIMIT 1"))
    invoice = result.fetchone()
    
    if invoice:
        invoice_id = invoice[0]
        print(f"Latest invoice: ID={invoice_id}, Number={invoice[1]}, Status={invoice[2]}")
        
        # Update buyer_id
        db.execute(text(f"UPDATE invoices SET buyer_id = 1 WHERE id = {invoice_id}"))
        db.commit()
        
        print(f"\n✅ Updated buyer_id to 1 for invoice #{invoice_id}")
        print(f"\n🎯 Bây giờ bạn có thể test:")
        print(f"   1. Login: sme@example.com / Password123!")
        print(f"   2. Chuyển sang tab '💳 To Pay'")
        print(f"   3. Tìm invoice: {invoice[1]}")
        print(f"   4. Click 'View' để xem chi tiết")
        print(f"   5. Click '✓ Chấp Nhận' để submit")
        print(f"   6. Status sẽ chuyển: DRAFT → SUBMITTED ✨")
    else:
        print("❌ No invoices found")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
