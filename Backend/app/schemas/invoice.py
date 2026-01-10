from pydantic import BaseModel, ConfigDict
from datetime import datetime, date

class InvoiceCreate(BaseModel):
    invoice_number: str
    serial_no: str | None = None
    issue_date: date | None = None
    lookup_code: str | None = None
    amount: float
    currency: str = "VND"
    buyer_name: str
    buyer_org_id: int | None = None
    funding_category: str | None = None
    funding_purpose: str | None = None
    recourse_type: int | None = None
    payment_term: int | None = None
    proposed_ltv: float | None = None
    discount_rate: float | None = None
    dispute_method: str | None = None

class InvoiceUpdate(BaseModel):
    """Schema for buyer editing invoice - allows editing all fields"""
    serial_no: str | None = None
    issue_date: date | None = None
    lookup_code: str | None = None
    amount: float | None = None
    currency: str | None = None
    buyer_name: str | None = None
    recourse_type: int | None = None
    payment_term: int | None = None
    proposed_ltv: float | None = None
    discount_rate: float | None = None
    funding_category: str | None = None
    funding_purpose: str | None = None
    dispute_method: str | None = None
    edit_note: str | None = None  # Buyer note about what changed

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    serial_no: str | None = None
    issue_date: date | None = None
    lookup_code: str | None = None
    amount: float
    currency: str
    status: str
    buyer_name: str
    buyer_org_id: int | None = None
    sme_id: int
    buyer_id: int | None = None
    seller_name: str | None = None  # SME/Seller name
    funding_category: str | None = None
    funding_purpose: str | None = None
    recourse_type: int | None = None
    payment_term: int | None = None
    proposed_ltv: float | None = None
    discount_rate: float | None = None
    dispute_method: str | None = None
    created_at: datetime
    
    # Bank purchase fields
    bank_id: int | None = None
    purchased_at: datetime | None = None
    purchase_price: float | None = None
    
    model_config = ConfigDict(from_attributes=True)
