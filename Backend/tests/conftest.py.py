"""
Pytest configuration and fixtures for testing
"""

import pytest
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment variables
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")


@pytest.fixture
def mock_user():
    """Fixture for a mock user"""
    return {
        "sub": "123",
        "email": "test@example.com",
        "roles": ["SME", "BUYER"],
        "role": "SME"
    }


@pytest.fixture
def mock_admin_user():
    """Fixture for a mock admin user"""
    return {
        "sub": "1",
        "email": "admin@example.com",
        "roles": ["ADMIN"],
        "role": "ADMIN"
    }


@pytest.fixture
def mock_invoice_data():
    """Fixture for valid invoice data"""
    return {
        "invoice_number": "INV-2024-001",
        "serial_no": "A12345",
        "issue_date": "2024-01-01",
        "amount": 1000000.0,
        "currency": "VND",
        "buyer_name": "Test Buyer Company",
        "buyer_org_id": 1,
        "payment_term": 30,
        "discount_rate": 5.0,
        "proposed_ltv": 80.0
    }
