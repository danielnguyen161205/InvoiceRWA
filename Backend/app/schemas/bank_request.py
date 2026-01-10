from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BankRequestCreate(BaseModel):
    invoice_id: int
    bank_ids: list[int]  # List of bank IDs to send request to


class BankRequestOut(BaseModel):
    id: int
    invoice_id: int
    bank_id: int
    sme_id: int
    status: str
    requested_at: datetime
    bank_responded_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    financing_started_at: Optional[datetime] = None
    bank_financed_at: Optional[datetime] = None
    sme_confirmed_receipt_at: Optional[datetime] = None
    financed_at: Optional[datetime] = None
    finance_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class BankResponseRequest(BaseModel):
    finance_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    notes: Optional[str] = None
