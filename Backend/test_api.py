"""Test API endpoints"""
from app.db.session import SessionLocal
from app.models.user import User
from app.models.invoice import Invoice
from app.core.security import create_access_token
import requests

# Get user
db = SessionLocal()
user = db.query(User).filter(User.email == 'sme@example.com').first()
print(f"User ID: {user.id}, Email: {user.email}, Role: {user.role}")

# Get invoices
invoices = db.query(Invoice).filter(Invoice.sme_id == user.id).all()
print(f"\nInvoices in DB for user {user.id}: {len(invoices)}")
for inv in invoices:
    print(f"  - {inv.invoice_number}: ${inv.amount}, status={inv.status}, sme_id={inv.sme_id}, created_at={inv.created_at}")

# Create token
token = create_access_token({"sub": str(user.id), "roles": ["SME"]})
print(f"\nGenerated Token: {token}")

# Test API
headers = {"Authorization": f"Bearer {token}"}
try:
    response = requests.get("http://127.0.0.1:8000/invoices", headers=headers)
    print(f"\nAPI Response Status: {response.status_code}")
    print(f"API Response: {response.json()}")
except Exception as e:
    print(f"\nAPI Error: {e}")

db.close()
