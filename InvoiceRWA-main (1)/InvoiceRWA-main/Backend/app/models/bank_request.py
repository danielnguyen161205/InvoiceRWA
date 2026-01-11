from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from app.db.base import Base
from enum import Enum as PyEnum
import datetime


class BankRequestStatus(str, PyEnum):
    PENDING = "PENDING"           # Request sent to bank, awaiting response
    REJECTED = "REJECTED"         # Bank rejected the request
    FINANCING = "FINANCING"       # Bank accepted and started financing
    FINANCED = "FINANCED"         # Both bank transferred money and SME confirmed receipt
    CANCELLED = "CANCELLED"       # SME cancelled the request


class BankRequest(Base):
    __tablename__ = "bank_requests"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    bank_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sme_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    status = Column(String(50), default="PENDING")
    
    # Request details
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Bank response
    bank_responded_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Financing details
    financing_started_at = Column(DateTime, nullable=True)
    bank_financed_at = Column(DateTime, nullable=True)  # When bank marked as financed
    sme_confirmed_receipt_at = Column(DateTime, nullable=True)  # When SME confirmed receipt
    financed_at = Column(DateTime, nullable=True)  # When both confirmed (final)
    
    finance_amount = Column(Integer, nullable=True)
    interest_rate = Column(Integer, nullable=True)
    
    # Additional fields
    notes = Column(Text, nullable=True)
