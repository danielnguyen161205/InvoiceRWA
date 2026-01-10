"""Test API endpoints"""
import pytest
from app.db.session import SessionLocal
from app.models.user import User
from app.models.invoice import Invoice
from app.core.security import create_access_token
import requests


def test_invoice_api():
    """Test invoice API endpoints"""
    db = SessionLocal()

    try:
        # Get user
        user = db.query(User).filter(User.email == 'sme@example.com').first()

        if not user:
            pytest.skip("No SME user found in database")

        print(f"User ID: {user.id}, Email: {user.email}, Role: {user.role}")

        # Get invoices
        invoices = db.query(Invoice).filter(Invoice.sme_id == user.id).all()
        print(f"Invoices in DB for user {user.id}: {len(invoices)}")
        for inv in invoices:
            print(f"  - {inv.invoice_number}: ${inv.amount}, status={inv.status}")

        # Create token
        token = create_access_token({"sub": str(user.id), "roles": ["SME"]})
        print(f"Generated Token: {token[:20]}...")

        # Test API
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("http://127.0.0.1:8000/api/invoices", headers=headers)

        print(f"API Response Status: {response.status_code}")

        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        result = response.json()
        # Handle both old format (array) and new format (object with data key)
        invoices_data = result.get('data', result) if isinstance(result, dict) else result

        print(f"API returned {len(invoices_data)} invoices")

    finally:
        db.close()


def test_invoice_pagination():
    """Test invoice API pagination"""
    db = SessionLocal()

    try:
        # Get admin user
        admin = db.query(User).filter(User.email == 'admin@invoicerwa.com').first()

        if not admin:
            pytest.skip("No admin user found in database")

        # Create token
        token = create_access_token({"sub": str(admin.id), "roles": ["ADMIN"]})

        # Test pagination with page parameter
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("http://127.0.0.1:8000/api/invoices?page=1&page_size=10", headers=headers)

        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        result = response.json()

        # Verify new pagination format
        assert "data" in result, "Response should have 'data' key"
        assert "pagination" in result, "Response should have 'pagination' key"
        assert "total" in result["pagination"], "Pagination should have 'total'"
        assert "page" in result["pagination"], "Pagination should have 'page'"
        assert "total_pages" in result["pagination"], "Pagination should have 'total_pages'"

        print(f"PAGINATION TEST: Page {result['pagination']['page']}/{result['pagination']['total_pages']}, Total: {result['pagination']['total']}")

    finally:
        db.close()
