"""
Script to create test user and invoice
"""
import requests
import json

API_URL = "http://127.0.0.1:8000"

# Step 1: Register SME user
print("Creating SME user: sme@example.com...")
register_response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": "sme@example.com",
        "password": "password123",
        "role": "SME"
    }
)

if register_response.status_code == 200:
    print("✓ SME user created successfully!")
elif "already exists" in register_response.text.lower():
    print("✓ SME user already exists, continuing...")
else:
    print(f"Registration failed: {register_response.text}")

# Step 2: Login as sme@example.com
print("\nLogging in as sme@example.com...")
login_response = requests.post(
    f"{API_URL}/api/auth/login",
    json={
        "email": "sme@example.com",
        "password": "Password123!"
    }
)

if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
print(f"✓ Login successful!")

# Step 3: Create test invoices
print("\nCreating test invoices...")

test_invoices = [
    {
        "invoice_number": "INV-2026-001",
        "amount": 15000.00,
        "buyer_name": "ABC Corporation"
    },
    {
        "invoice_number": "INV-2026-002",
        "amount": 25000.00,
        "buyer_name": "XYZ Industries"
    },
    {
        "invoice_number": "INV-2026-003",
        "amount": 8500.00,
        "buyer_name": "Tech Solutions Ltd"
    }
]

for invoice_data in test_invoices:
    create_response = requests.post(
        f"{API_URL}/api/invoices/",
        json=invoice_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if create_response.status_code == 200:
        invoice = create_response.json()
        print(f"✓ Created: {invoice['invoice_number']} - ${invoice['amount']} - {invoice['status']}")
    else:
        print(f"✗ Failed to create {invoice_data['invoice_number']}: {create_response.text}")

print("\n✅ Test setup completed!")
print(f"📊 You can now view invoices at: http://127.0.0.1:5500/assets/pages/sme-dashboard.html")
print(f"🔐 Login with: sme@example.com / Password123!")
