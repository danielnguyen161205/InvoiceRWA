from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Date, Text, Boolean
from app.db.base import Base
from enum import Enum as PyEnum
import datetime

class InvoiceStatus(str, PyEnum):
    DRAFT = "DRAFT"              # Supplier created/resubmitted - waiting for Buyer
    EDITING = "EDITING"          # Buyer requested changes
    SUBMITTED = "SUBMITTED"      # Buyer accepted - snapshot locked
    APPROVED = "APPROVED"        # System verified - ready for finance
    FINANCED = "FINANCED"        # Purchased by Bank - financing in progress
    SETTLED = "SETTLED"          # Buyer marked as paid - waiting for bank confirmation
    CLOSED = "CLOSED"            # Bank confirmed payment received - invoice complete
    DISPUTED = "DISPUTED"        # Buyer raised dispute
    REJECTED = "REJECTED"        # Rejected by buyer/system

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, index=True)
    serial_no = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    lookup_code = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="VND")
    status = Column(String(50), default="DRAFT")
    sme_id = Column(Integer, ForeignKey("users.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Added buyer_id
    buyer_name = Column(String(255))
    buyer_org_id = Column(Integer, nullable=True)
    sme_org_id = Column(Integer, nullable=True)  # SME organization ID (seller)
    funding_category = Column(String(100), nullable=True)
    funding_purpose = Column(Text, nullable=True)
    recourse_type = Column(Integer, nullable=True)
    payment_term = Column(Integer, nullable=True)
    proposed_ltv = Column(Float, nullable=True)
    discount_rate = Column(Float, nullable=True)
    dispute_method = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Revision & Change tracking
    revision_no = Column(Integer, default=1)
    resubmitted_at = Column(DateTime, nullable=True)
    resubmit_note = Column(Text, nullable=True)
    
    # Snapshot locking (when SUBMITTED)
    locked_snapshot_hash = Column(String(64), nullable=True)
    locked_at = Column(DateTime, nullable=True)
    locked_by = Column(Integer, nullable=True)  # buyer_id who accepted
    
    # Dispute tracking
    disputed = Column(Boolean, default=False)
    dispute_reason = Column(String(255), nullable=True)  # Legacy field
    dispute_note = Column(Text, nullable=True)  # Legacy field
    disputed_at = Column(DateTime, nullable=True)
    disputed_by = Column(Integer, nullable=True)  # user_id who raised dispute
    
    # New dispute system fields
    dispute_type = Column(String(50), nullable=True)  # PRE_FINANCE or POST_FINANCE
    dispute_case_id = Column(String(100), nullable=True)  # Unique case identifier
    dispute_description = Column(Text, nullable=True)  # Detailed description
    dispute_resolved = Column(Boolean, default=False)
    dispute_resolved_at = Column(DateTime, nullable=True)
    
    # Change request tracking (for EDITING status)
    change_request = Column(Text, nullable=True)
    change_requested_at = Column(DateTime, nullable=True)
    change_requested_by = Column(Integer, nullable=True)
    
    # Bank purchase tracking
    bank_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Bank who purchased
    purchased_at = Column(DateTime, nullable=True)
    purchase_price = Column(Float, nullable=True)
    
    # Payment tracking
    paid_at = Column(DateTime, nullable=True)  # When buyer marked as paid
    closed_at = Column(DateTime, nullable=True)  # When bank confirmed payment  # Actual purchase amount
    
    # Blockchain/NFT fields
    token_id = Column(String(100), nullable=True)  # NFT token ID
    nft_contract_address = Column(String(255), nullable=True)  # Smart contract address
    token_standard = Column(String(20), nullable=True)  # e.g., ERC-721
    blockchain_tx_hash = Column(String(255), nullable=True)  # Mint transaction hash
    tokenized_at = Column(DateTime, nullable=True)  # When NFT was minted
