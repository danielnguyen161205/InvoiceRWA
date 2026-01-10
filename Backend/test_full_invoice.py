"""
Quick test - Create invoice with full data
"""
import requests

API_URL = "http://127.0.0.1:8000"

# Login
login_resp = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "sme@example.com",
    "password": "Password123!"
})

token = login_resp.json()["access_token"]
print("✓ Logged in")

# Create full invoice
invoice_data = {
    "invoice_number": "FULL-TEST-001",
    "serial_no": "C26TAA",
    "issue_date": "2026-01-08",
    "lookup_code": "ABC123XYZ",
    "amount": 25000.0,
    "currency": "VND",
    "buyer_name": "Tech Corp Ltd",
    "buyer_org_id": None,
    "funding_category": "working_capital",
    "funding_purpose": "Vốn lưu động để mua nguyên vật liệu sản xuất trong quý 1/2026",
    "recourse_type": 1,
    "payment_term": 60,
    "proposed_ltv": 80.0,
    "discount_rate": 12.5,
    "dispute_method": "VIAC"
}

response = requests.post(
    f"{API_URL}/api/invoices/",
    json=invoice_data,
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
)

if response.status_code == 200:
    inv = response.json()
    print(f"\n✅ Created invoice with full data:")
    print(f"  ID: {inv['id']}")
    print(f"  Number: {inv['invoice_number']}")
    print(f"  Serial: {inv.get('serial_no', '-')}")
    print(f"  Issue Date: {inv.get('issue_date', '-')}")
    print(f"  Amount: {inv['amount']} {inv.get('currency', 'VND')}")
    print(f"  LTV: {inv.get('proposed_ltv', '-')}%")
    print(f"  Discount Rate: {inv.get('discount_rate', '-')}%")
else:
    print(f"❌ Error: {response.text}")
