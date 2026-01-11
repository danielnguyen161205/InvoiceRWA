"""
Test script for Bank role functionality
Creates test data and verifies Bank endpoints
"""

import requests
import sys

API_URL = "http://127.0.0.1:8000"

def test_bank_registration():
    """Test registering a Bank user"""
    print("\n1️⃣ Testing Bank Registration...")
    
    data = {
        "email": "testbank@example.com",
        "password": "BankPass123!",
        "role": ["BANK"]
    }
    
    response = requests.post(f"{API_URL}/api/auth/register", json=data)
    
    if response.status_code == 200:
        print("✅ Bank registration successful")
        return True
    else:
        print(f"❌ Bank registration failed: {response.text}")
        return False

def test_bank_login():
    """Test Bank user login"""
    print("\n2️⃣ Testing Bank Login...")
    
    data = {
        "email": "testbank@example.com",
        "password": "BankPass123!"
    }
    
    response = requests.post(f"{API_URL}/api/auth/login", json=data)
    
    if response.status_code == 200:
        result = response.json()
        token = result.get("access_token")
        print("✅ Bank login successful")
        print(f"   Token: {token[:50]}...")
        return token
    else:
        print(f"❌ Bank login failed: {response.text}")
        return None

def test_view_approved_invoices(token):
    """Test viewing approved invoices"""
    print("\n3️⃣ Testing View Approved Invoices...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/invoices/bank/approved", headers=headers)
    
    if response.status_code == 200:
        invoices = response.json()
        print(f"✅ Retrieved {len(invoices)} approved invoices")
        if invoices:
            print(f"   First invoice: {invoices[0]['invoice_number']} - {invoices[0]['amount']} VND")
        return invoices
    else:
        print(f"❌ Failed to retrieve approved invoices: {response.text}")
        return []

def test_purchase_invoice(token, invoice_id):
    """Test purchasing an invoice"""
    print(f"\n4️⃣ Testing Purchase Invoice (ID: {invoice_id})...")
    
    headers = {"Authorization": f"Bearer {token}"}
    data = {"purchase_price": 95000000}
    
    response = requests.post(
        f"{API_URL}/invoices/{invoice_id}/purchase",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Invoice purchased successfully")
        print(f"   Invoice: {result['message']}")
        return True
    else:
        print(f"❌ Failed to purchase invoice: {response.text}")
        return False

def test_view_purchased_invoices(token):
    """Test viewing purchased invoices"""
    print("\n5️⃣ Testing View Purchased Invoices...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/invoices/bank/purchased", headers=headers)
    
    if response.status_code == 200:
        invoices = response.json()
        print(f"✅ Retrieved {len(invoices)} purchased invoices")
        if invoices:
            for inv in invoices:
                print(f"   - {inv['invoice_number']}: Bought for {inv['purchase_price']} VND")
        return invoices
    else:
        print(f"❌ Failed to retrieve purchased invoices: {response.text}")
        return []

def run_all_tests():
    """Run all Bank role tests"""
    print("=" * 60)
    print("BANK ROLE - COMPREHENSIVE TEST SUITE")
    print("=" * 60)
    
    # Step 1: Register Bank user (might fail if already exists)
    test_bank_registration()
    
    # Step 2: Login
    token = test_bank_login()
    if not token:
        print("\n❌ Cannot proceed without valid token")
        sys.exit(1)
    
    # Step 3: View available invoices
    approved_invoices = test_view_approved_invoices(token)
    
    # Step 4: Purchase an invoice (if available)
    if approved_invoices:
        first_invoice = approved_invoices[0]
        test_purchase_invoice(token, first_invoice['id'])
    else:
        print("\n⚠️ No approved invoices available for purchase")
        print("   Please create and approve some invoices first")
    
    # Step 5: View purchased invoices
    test_view_purchased_invoices(token)
    
    print("\n" + "=" * 60)
    print("TEST SUITE COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()
