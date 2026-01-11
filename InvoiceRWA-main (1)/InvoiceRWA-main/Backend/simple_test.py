"""
Simple test to create one invoice with detailed error handling
"""
import requests

API_URL = "http://127.0.0.1:8000"

# Login
print("Logging in...")
login_resp = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "sme@example.com",
    "password": "Password123!"
})
print(f"Login status: {login_resp.status_code}")
if login_resp.status_code != 200:
    print(f"Error: {login_resp.text}")
    exit(1)

token = login_resp.json()["access_token"]
print(f"Token obtained: {token[:30]}...")

# Create invoice
print("\nCreating invoice...")
invoice_data = {
    "invoice_number": "TEST-001",
    "amount": 5000.0,
    "buyer_name": "Test Buyer Corp"
}

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"Sending POST to {API_URL}/api/invoices/")
print(f"Data: {invoice_data}")

response = requests.post(
    f"{API_URL}/api/invoices/",
    json=invoice_data,
    headers=headers
)

print(f"\nResponse status: {response.status_code}")
print(f"Response body: {response.text}")

if response.status_code == 200:
    invoice = response.json()
    print(f"\n✅ SUCCESS!")
    print(f"Invoice ID: {invoice['id']}")
    print(f"Invoice Number: {invoice['invoice_number']}")
    print(f"Amount: ${invoice['amount']}")
    print(f"Status: {invoice['status']}")
else:
    print(f"\n❌ FAILED")
