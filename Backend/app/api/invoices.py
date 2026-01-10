from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceOut, InvoiceUpdate
from app.core.security import get_current_user
from pydantic import BaseModel
import datetime
import hashlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,   # keep True if you use cookies/auth; safe for JWT header too
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/invoices", tags=["Invoices"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SME CREATE INVOICE
@router.post("/", response_model=InvoiceOut)
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "SME" not in roles:
        raise HTTPException(status_code=403, detail="Only SME can create invoice")
    
     # Validate amount
    if data.amount is None or data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be a positive number")
    if data.amount > 10_000_000_000:  # 10 billion
        raise HTTPException(status_code=400, detail="Amount exceeds maximum allowed (10 billion)")

    # Validate discount_rate
    if data.discount_rate is not None and data.discount_rate < 0:
        raise HTTPException(status_code=400, detail="Discount rate cannot be negative")

    # Validate payment_term
    if data.payment_term is not None and data.payment_term <= 0:
        raise HTTPException(status_code=400, detail="Payment term must be positive")

    user_id = int(user["sub"])
    
    # Get SME user's organization_id
    sme_user = db.query(User).filter(User.id == user_id).first()
    sme_org_id = sme_user.organization_id if sme_user else None
    
    # Find buyer_id from buyer_org_id
    buyer_user_id = None
    if data.buyer_org_id:
        # Find any user linked to this organization with BUYER role
        buyer_user = db.query(User).filter(
            User.organization_id == data.buyer_org_id,
            (User.roles.like('%BUYER%')) | (User.role == 'BUYER')
        ).first()
        if buyer_user:
            buyer_user_id = buyer_user.id

    invoice = Invoice(
        invoice_number=data.invoice_number,
        serial_no=data.serial_no,
        issue_date=data.issue_date,
        lookup_code=data.lookup_code,
        amount=data.amount,
        currency=data.currency,
        buyer_name=data.buyer_name,
        buyer_org_id=data.buyer_org_id,
        buyer_id=buyer_user_id,  # Set buyer_id from org lookup
        sme_org_id=sme_org_id,  # Auto-assign SME organization
        funding_category=data.funding_category,
        funding_purpose=data.funding_purpose,
        recourse_type=data.recourse_type,
        payment_term=data.payment_term,
        proposed_ltv=data.proposed_ltv,
        discount_rate=data.discount_rate,
        dispute_method=data.dispute_method,
        sme_id=user_id,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


# VIEW ALL MY INVOICES (as SME or BUYER)
@router.get("/", response_model=list[InvoiceOut])
def list_my_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    from sqlalchemy.orm import joinedload
    
    user_id = int(user["sub"])
    
    # Get all invoices where user is either SME or Buyer with seller information
    invoices_query = db.query(Invoice).outerjoin(
        User, Invoice.sme_id == User.id
    ).filter(
        (Invoice.sme_id == user_id) | (Invoice.buyer_id == user_id)
    )
    
    invoices = invoices_query.all()
    
    # Add seller_name to each invoice object
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "serial_no": invoice.serial_no,
            "issue_date": invoice.issue_date,
            "lookup_code": invoice.lookup_code,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "buyer_org_id": invoice.buyer_org_id,
            "sme_id": invoice.sme_id,
            "buyer_id": invoice.buyer_id,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "recourse_type": invoice.recourse_type,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "dispute_method": invoice.dispute_method,
            "created_at": invoice.created_at,
            "bank_id": invoice.bank_id,
            "purchased_at": invoice.purchased_at,
            "purchase_price": invoice.purchase_price,
            # Financing confirmation fields
            "bank_confirmed_financed": invoice.bank_confirmed_financed or False,
            "sme_confirmed_receipt": invoice.sme_confirmed_receipt or False,
            "bank_financed_at": invoice.bank_financed_at,
            "sme_confirmed_at": getattr(invoice, 'sme_confirmed_at', None),
            # NFT fields
            "token_id": invoice.token_id,
            "nft_contract_address": invoice.nft_contract_address,
            "blockchain_tx_hash": invoice.blockchain_tx_hash,
            "tokenized_at": invoice.tokenized_at
        }
        
        # Get seller name from sme_id
        if invoice.sme_id:
            seller = db.query(User).filter(User.id == invoice.sme_id).first()
            if seller and seller.organization_id:
                from app.models.organization import Organization
                org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
                invoice_dict["seller_name"] = org.legal_name if org else seller.email
            else:
                invoice_dict["seller_name"] = seller.email if seller else None
        else:
            invoice_dict["seller_name"] = None
            
        result.append(invoice_dict)
    
    return result


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice_by_id(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get a single invoice by ID"""
    from app.models.user import User
    
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if user has access to this invoice
    user_id = int(user["sub"])
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    
    # Admin and Bank can see all invoices
    if "ADMIN" not in roles and "BANK" not in roles:
        # SME/Buyer can only see their own invoices
        if invoice.sme_id != user_id and invoice.buyer_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Create invoice dict with seller information
    invoice_dict = {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "serial_no": invoice.serial_no,
        "issue_date": invoice.issue_date,
        "lookup_code": invoice.lookup_code,
        "amount": invoice.amount,
        "currency": invoice.currency,
        "status": invoice.status,
        "buyer_name": invoice.buyer_name,
        "buyer_org_id": invoice.buyer_org_id,
        "sme_id": invoice.sme_id,
        "buyer_id": invoice.buyer_id,
        "funding_category": invoice.funding_category,
        "funding_purpose": invoice.funding_purpose,
        "recourse_type": invoice.recourse_type,
        "payment_term": invoice.payment_term,
        "proposed_ltv": invoice.proposed_ltv,
        "discount_rate": invoice.discount_rate,
        "dispute_method": invoice.dispute_method,
        "created_at": invoice.created_at,
        "bank_id": invoice.bank_id,
        "purchased_at": invoice.purchased_at,
        "purchase_price": invoice.purchase_price
    }
    
    # Get seller name from sme_id
    if invoice.sme_id:
        seller = db.query(User).filter(User.id == invoice.sme_id).first()
        if seller and seller.organization_id:
            from app.models.organization import Organization
            org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
            invoice_dict["seller_name"] = org.legal_name if org else seller.email
        else:
            invoice_dict["seller_name"] = seller.email if seller else None
    else:
        invoice_dict["seller_name"] = None
        
    return invoice_dict


# BUYER: REQUEST CHANGES (DRAFT → EDITING)
class ChangeRequest(BaseModel):
    change_request: str

@router.post("/{invoice_id}/request-changes")
def request_changes(
    invoice_id: int,
    data: ChangeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Buyer requests changes to invoice (DRAFT → EDITING)"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Only buyer can request changes
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Only buyer can request changes")
    
    if invoice.status != "DRAFT":
        raise HTTPException(status_code=400, detail="Can only request changes on DRAFT invoices")

    invoice.status = "EDITING"
    invoice.change_request = data.change_request
    invoice.change_requested_at = datetime.datetime.utcnow()
    invoice.change_requested_by = user_id
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Change request sent", "status": invoice.status}


# BUYER: EDIT INVOICE DIRECTLY (DRAFT → EDITING)
@router.put("/{invoice_id}/buyer-edit")
def buyer_edit_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Buyer edits invoice directly (DRAFT → EDITING, needs SME approval)"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Only buyer can edit
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Only buyer can edit invoice")
    
    if invoice.status not in ["DRAFT", "EDITING"]:
        raise HTTPException(status_code=400, detail="Can only edit DRAFT or EDITING invoices")

    # Update invoice fields - all editable fields
    if data.serial_no is not None:
        invoice.serial_no = data.serial_no
    if data.issue_date is not None:
        invoice.issue_date = data.issue_date
    if data.lookup_code is not None:
        invoice.lookup_code = data.lookup_code
    if data.amount is not None:
        invoice.amount = data.amount
    if data.currency is not None:
        invoice.currency = data.currency
    if data.buyer_name is not None:
        invoice.buyer_name = data.buyer_name
    if data.recourse_type is not None:
        invoice.recourse_type = data.recourse_type
    if data.payment_term is not None:
        invoice.payment_term = data.payment_term
    if data.proposed_ltv is not None:
        invoice.proposed_ltv = data.proposed_ltv
    if data.discount_rate is not None:
        invoice.discount_rate = data.discount_rate
    if data.funding_category is not None:
        invoice.funding_category = data.funding_category
    if data.funding_purpose is not None:
        invoice.funding_purpose = data.funding_purpose
    if data.dispute_method is not None:
        invoice.dispute_method = data.dispute_method
    
    # Change status to EDITING (waiting for SME to resubmit/accept)
    invoice.status = "EDITING"
    invoice.change_request = data.edit_note or "Buyer edited invoice directly"
    invoice.change_requested_at = datetime.datetime.utcnow()
    invoice.change_requested_by = user_id
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice updated. Waiting for supplier approval.", "status": invoice.status}


# SME: EDIT INVOICE DIRECTLY (DRAFT/EDITING → EDITING)
@router.put("/{invoice_id}/sme-edit")
def sme_edit_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """SME edits invoice directly (DRAFT/EDITING → EDITING, needs Buyer approval)"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Only SME can edit
    if invoice.sme_id != user_id:
        raise HTTPException(status_code=403, detail="Only SME can edit invoice")
    
    if invoice.status not in ["DRAFT", "EDITING"]:
        raise HTTPException(status_code=400, detail="Can only edit DRAFT or EDITING invoices")

    # Update invoice fields - all editable fields
    if data.serial_no is not None:
        invoice.serial_no = data.serial_no
    if data.issue_date is not None:
        invoice.issue_date = data.issue_date
    if data.lookup_code is not None:
        invoice.lookup_code = data.lookup_code
    if data.amount is not None:
        invoice.amount = data.amount
    if data.currency is not None:
        invoice.currency = data.currency
    if data.buyer_name is not None:
        invoice.buyer_name = data.buyer_name
    if data.recourse_type is not None:
        invoice.recourse_type = data.recourse_type
    if data.payment_term is not None:
        invoice.payment_term = data.payment_term
    if data.proposed_ltv is not None:
        invoice.proposed_ltv = data.proposed_ltv
    if data.discount_rate is not None:
        invoice.discount_rate = data.discount_rate
    if data.funding_category is not None:
        invoice.funding_category = data.funding_category
    if data.funding_purpose is not None:
        invoice.funding_purpose = data.funding_purpose
    if data.dispute_method is not None:
        invoice.dispute_method = data.dispute_method
    
    # Change status to EDITING (waiting for Buyer to accept/submit)
    invoice.status = "EDITING"
    invoice.change_request = data.edit_note or "SME edited invoice directly"
    invoice.change_requested_at = datetime.datetime.utcnow()
    invoice.change_requested_by = user_id
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice updated. Waiting for buyer approval.", "status": invoice.status}


# ADMIN: EDIT INVOICE (can edit any invoice, any status)
@router.put("/{invoice_id}/admin-edit")
def admin_edit_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Admin can edit any invoice field including organization IDs"""
    invoice = db.query(Invoice).get(invoice_id)

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if user is ADMIN
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Only ADMIN can use this endpoint")

    # Update all invoice fields including org IDs
    if data.serial_no is not None:
        invoice.serial_no = data.serial_no
    if data.issue_date is not None:
        invoice.issue_date = data.issue_date
    if data.lookup_code is not None:
        invoice.lookup_code = data.lookup_code
    if data.amount is not None:
        invoice.amount = data.amount
    if data.currency is not None:
        invoice.currency = data.currency
    if data.buyer_name is not None:
        invoice.buyer_name = data.buyer_name
    if data.recourse_type is not None:
        invoice.recourse_type = data.recourse_type
    if data.payment_term is not None:
        invoice.payment_term = data.payment_term
    if data.proposed_ltv is not None:
        invoice.proposed_ltv = data.proposed_ltv
    if data.discount_rate is not None:
        invoice.discount_rate = data.discount_rate
    if data.funding_category is not None:
        invoice.funding_category = data.funding_category
    if data.funding_purpose is not None:
        invoice.funding_purpose = data.funding_purpose
    if data.dispute_method is not None:
        invoice.dispute_method = data.dispute_method
    
    # Admin can update organization IDs
    if hasattr(data, 'sme_org_id') and data.sme_org_id is not None:
        invoice.sme_org_id = data.sme_org_id
    if hasattr(data, 'buyer_org_id') and data.buyer_org_id is not None:
        invoice.buyer_org_id = data.buyer_org_id
    
    # Log the change
    invoice.change_request = data.edit_note or "Admin edited invoice"
    invoice.change_requested_at = datetime.datetime.utcnow()
    invoice.change_requested_by = int(user["sub"])
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice updated by admin", "status": invoice.status}


# SUPPLIER: RESUBMIT AFTER EDITING (EDITING → DRAFT)
class ResubmitData(BaseModel):
    resubmit_note: str

@router.post("/{invoice_id}/resubmit")
def resubmit_invoice(
    invoice_id: int,
    data: ResubmitData,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Supplier resubmits after making changes (EDITING → DRAFT)"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Only supplier (SME) can resubmit
    if invoice.sme_id != user_id:
        raise HTTPException(status_code=403, detail="Only supplier can resubmit")
    
    if invoice.status != "EDITING":
        raise HTTPException(status_code=400, detail="Can only resubmit invoices in EDITING status")

    # Increment revision
    invoice.revision_no = (invoice.revision_no or 1) + 1
    invoice.status = "DRAFT"
    invoice.resubmitted_at = datetime.datetime.utcnow()
    invoice.resubmit_note = data.resubmit_note
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice resubmitted for buyer review", "status": invoice.status, "revision": invoice.revision_no}


# BUYER: ACCEPT INVOICE (DRAFT → SUBMITTED + lock snapshot)
@router.post("/{invoice_id}/accept")
def accept_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Buyer accepts invoice - locks snapshot (DRAFT → SUBMITTED)"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Only buyer can accept
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Only buyer can accept invoice")
    
    if invoice.status != "DRAFT":
        raise HTTPException(status_code=400, detail="Can only accept DRAFT invoices")

    # Create snapshot hash (simplified - hash key invoice data)
    snapshot_data = f"{invoice.invoice_number}|{invoice.amount}|{invoice.issue_date}|{invoice.buyer_id}|{invoice.sme_id}"
    snapshot_hash = hashlib.sha256(snapshot_data.encode()).hexdigest()
    
    invoice.status = "SUBMITTED"
    invoice.locked_snapshot_hash = snapshot_hash
    invoice.locked_at = datetime.datetime.utcnow()
    invoice.locked_by = user_id
    
    db.commit()
    db.refresh(invoice)
    return {
        "message": "Invoice accepted and locked", 
        "status": invoice.status,
        "snapshot_hash": snapshot_hash
    }


# BUYER: REJECT INVOICE (DRAFT/EDITING → REJECTED)
class RejectData(BaseModel):
    reason: str

@router.post("/{invoice_id}/reject")
def reject_invoice(
    invoice_id: int,
    data: RejectData,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Buyer rejects invoice"""
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Buyer or Admin can reject
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    is_buyer = invoice.buyer_id == user_id
    is_admin = "ADMIN" in roles
    
    if not (is_buyer or is_admin):
        raise HTTPException(status_code=403, detail="Only buyer or admin can reject")
    
    if invoice.status not in ["DRAFT", "EDITING", "SUBMITTED"]:
        raise HTTPException(status_code=400, detail="Cannot reject invoice in current status")

    invoice.status = "REJECTED"
    invoice.dispute_reason = data.reason
    invoice.disputed_at = datetime.datetime.utcnow()
    invoice.disputed_by = user_id
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice rejected", "status": invoice.status}


# SUBMIT INVOICE (SME or BUYER can submit) - DEPRECATED, use /accept instead
@router.post("/{invoice_id}/submit")
def submit_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    invoice = db.query(Invoice).get(invoice_id)
    user_id = int(user["sub"])

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Allow both SME and Buyer to submit
    if invoice.sme_id != user_id and invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to submit this invoice")

    invoice.status = "SUBMITTED"
    db.commit()
    return {"message": "Invoice submitted successfully", "status": invoice.status}


# BANK VIEW SUBMITTED INVOICES
@router.get("/bank/pending", response_model=list[InvoiceOut])
def bank_view_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403)

    invoices = db.query(Invoice).filter(Invoice.status == "SUBMITTED").all()
    
    # Add seller information to each invoice
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "serial_no": invoice.serial_no,
            "issue_date": invoice.issue_date,
            "lookup_code": invoice.lookup_code,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "buyer_org_id": invoice.buyer_org_id,
            "sme_id": invoice.sme_id,
            "buyer_id": invoice.buyer_id,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "recourse_type": invoice.recourse_type,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "dispute_method": invoice.dispute_method,
            "created_at": invoice.created_at,
            "bank_id": invoice.bank_id,
            "purchased_at": invoice.purchased_at,
            "purchase_price": invoice.purchase_price
        }
        
        # Get seller name from sme_id
        if invoice.sme_id:
            seller = db.query(User).filter(User.id == invoice.sme_id).first()
            if seller and seller.organization_id:
                from app.models.organization import Organization
                org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
                invoice_dict["seller_name"] = org.legal_name if org else seller.email
            else:
                invoice_dict["seller_name"] = seller.email if seller else None
        else:
            invoice_dict["seller_name"] = None
            
        result.append(invoice_dict)
    
    return result


# BANK VIEW APPROVED INVOICES (available for purchase)
@router.get("/bank/approved", response_model=list[InvoiceOut])
def bank_view_approved_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can view approved invoices")

    # Get approved invoices that haven't been purchased yet
    invoices = db.query(Invoice).filter(
        Invoice.status == "APPROVED",
        Invoice.bank_id == None
    ).all()
    
    # Add seller information to each invoice
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "serial_no": invoice.serial_no,
            "issue_date": invoice.issue_date,
            "lookup_code": invoice.lookup_code,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "buyer_org_id": invoice.buyer_org_id,
            "sme_id": invoice.sme_id,
            "buyer_id": invoice.buyer_id,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "recourse_type": invoice.recourse_type,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "dispute_method": invoice.dispute_method,
            "created_at": invoice.created_at,
            "bank_id": invoice.bank_id,
            "purchased_at": invoice.purchased_at,
            "purchase_price": invoice.purchase_price
        }
        
        # Get seller name from sme_id
        if invoice.sme_id:
            seller = db.query(User).filter(User.id == invoice.sme_id).first()
            if seller and seller.organization_id:
                from app.models.organization import Organization
                org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
                invoice_dict["seller_name"] = org.legal_name if org else seller.email
            else:
                invoice_dict["seller_name"] = seller.email if seller else None
        else:
            invoice_dict["seller_name"] = None
            
        result.append(invoice_dict)
    
    return result


# BANK VIEW PURCHASED INVOICES
@router.get("/bank/purchased", response_model=list[InvoiceOut])
def bank_view_purchased_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can view purchased invoices")

    # Get invoices purchased by this bank
    invoices = db.query(Invoice).filter(Invoice.bank_id == user_id).all()
    
    # Add seller information to each invoice
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "serial_no": invoice.serial_no,
            "issue_date": invoice.issue_date,
            "lookup_code": invoice.lookup_code,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "buyer_org_id": invoice.buyer_org_id,
            "sme_id": invoice.sme_id,
            "buyer_id": invoice.buyer_id,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "recourse_type": invoice.recourse_type,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "dispute_method": invoice.dispute_method,
            "created_at": invoice.created_at,
            "bank_id": invoice.bank_id,
            "purchased_at": invoice.purchased_at,
            "purchase_price": invoice.purchase_price
        }
        
        # Get seller name from sme_id
        if invoice.sme_id:
            seller = db.query(User).filter(User.id == invoice.sme_id).first()
            if seller and seller.organization_id:
                from app.models.organization import Organization
                org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
                invoice_dict["seller_name"] = org.legal_name if org else seller.email
            else:
                invoice_dict["seller_name"] = seller.email if seller else None
        else:
            invoice_dict["seller_name"] = None
            
        result.append(invoice_dict)
    
    return result


# BANK PURCHASE INVOICE
class PurchaseInvoiceData(BaseModel):
    purchase_price: float

@router.post("/{invoice_id}/purchase")
def purchase_invoice(
    invoice_id: int,
    data: PurchaseInvoiceData,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank purchases an approved invoice and receives NFT ownership"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can purchase invoices")

    invoice = db.query(Invoice).get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Only APPROVED invoices can be purchased")
    
    if invoice.bank_id is not None:
        raise HTTPException(status_code=400, detail="Invoice already purchased")

    # If invoice has NFT, transfer it to bank
    nft_transfer_result = None
    if invoice.token_id:
        from app.services.web3_service import web3_service
        from app.models.organization import Organization
        from app.models.user import User
        
        # Get bank user's organization
        bank_user = db.query(User).filter(User.id == user_id).first()
        if not bank_user or not bank_user.organization_id:
            raise HTTPException(status_code=400, detail="Bank user must have an organization")
        
        bank_org = db.query(Organization).filter(Organization.id == bank_user.organization_id).first()
        if not bank_org or not bank_org.wallet_address:
            raise HTTPException(status_code=400, detail="Bank organization must have a wallet address")
        
        # Get SME organization wallet
        sme_org = db.query(Organization).filter(Organization.id == invoice.sme_org_id).first()
        if not sme_org or not sme_org.wallet_address:
            raise HTTPException(status_code=400, detail="SME organization wallet not found")
        
        # Transfer NFT from SME to Bank
        try:
            nft_transfer_result = web3_service.transfer_nft(
                from_address=sme_org.wallet_address,
                to_address=bank_org.wallet_address,
                token_id=int(invoice.token_id)
            )
            
            if not nft_transfer_result or not nft_transfer_result.get('success'):
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to transfer NFT: {nft_transfer_result.get('error', 'Unknown error')}"
                )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"NFT transfer error: {str(e)}")

    # Record the purchase and change status to FINANCED
    invoice.bank_id = user_id
    invoice.purchased_at = datetime.datetime.utcnow()
    invoice.purchase_price = data.purchase_price
    invoice.status = "FINANCED"  # Change status from APPROVED to FINANCED
    
    db.commit()
    db.refresh(invoice)
    
    response = {
        "message": "Invoice purchased successfully",
        "invoice": invoice
    }
    
    if nft_transfer_result:
        response["nft_transfer"] = {
            "tx_hash": nft_transfer_result.get('tx_hash'),
            "from": nft_transfer_result.get('from'),
            "to": nft_transfer_result.get('to')
        }
    
    return response


# BUYER MARK INVOICE AS PAID (FINANCED -> SETTLED)
@router.post("/{invoice_id}/mark-paid")
def buyer_mark_paid(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Buyer marks invoice as paid (FINANCED -> SETTLED)"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    if "BUYER" not in roles and "SME" not in roles:
        raise HTTPException(status_code=403, detail="Only BUYER can mark invoice as paid")

    invoice = db.query(Invoice).get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if user is the buyer of this invoice
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="You can only mark your own invoices as paid")
    
    if invoice.status != "FINANCED":
        raise HTTPException(status_code=400, detail="Only FINANCED invoices can be marked as paid")

    invoice.status = "SETTLED"
    invoice.paid_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Invoice marked as paid successfully", "invoice": invoice}


# BANK CONFIRM PAYMENT (SETTLED -> CLOSED)
@router.post("/{invoice_id}/confirm-payment")
def bank_confirm_payment(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank confirms payment received (SETTLED -> CLOSED)"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can confirm payment")

    invoice = db.query(Invoice).get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if this bank owns the invoice
    if invoice.bank_id != user_id:
        raise HTTPException(status_code=403, detail="You can only confirm payment for your own invoices")
    
    if invoice.status != "SETTLED":
        raise HTTPException(status_code=400, detail="Only SETTLED invoices can be confirmed")

    invoice.status = "CLOSED"
    invoice.closed_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(invoice)
    return {"message": "Payment confirmed successfully", "invoice": invoice}


# ADMIN VIEW ALL INVOICES
@router.get("/admin/all", response_model=list[InvoiceOut])
def admin_view_all_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    from app.models.user import User
    from app.models.organization import Organization
    
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all invoices
    invoices = db.query(Invoice).all()
    
    # Add seller_name and buyer_name to each invoice
    result = []
    for invoice in invoices:
        invoice_dict = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "serial_no": invoice.serial_no,
            "issue_date": invoice.issue_date,
            "lookup_code": invoice.lookup_code,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "buyer_org_id": invoice.buyer_org_id,
            "sme_org_id": invoice.sme_org_id,
            "sme_id": invoice.sme_id,
            "buyer_id": invoice.buyer_id,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "recourse_type": invoice.recourse_type,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "dispute_method": invoice.dispute_method,
            "created_at": invoice.created_at,
            "bank_id": invoice.bank_id,
            "purchased_at": invoice.purchased_at,
            "purchase_price": invoice.purchase_price,
            "rejection_comment": invoice.rejection_comment,
            "rejected_at": invoice.rejected_at,
            "rejected_by": invoice.rejected_by,
            "token_id": invoice.token_id,
            "nft_contract_address": invoice.nft_contract_address,
            "token_standard": invoice.token_standard,
            "blockchain_tx_hash": invoice.blockchain_tx_hash,
            "tokenized_at": invoice.tokenized_at
        }
        
        # Get seller organization name from sme_org_id (preferred) or user's organization
        seller_name = None
        if invoice.sme_org_id:
            org = db.query(Organization).filter(Organization.id == invoice.sme_org_id).first()
            seller_name = org.legal_name or org.trade_name if org else None
        
        # Fallback to user's organization if sme_org_id not set
        if not seller_name and invoice.sme_id:
            seller = db.query(User).filter(User.id == invoice.sme_id).first()
            if seller and seller.organization_id:
                org = db.query(Organization).filter(Organization.id == seller.organization_id).first()
                seller_name = org.legal_name or org.trade_name if org else seller.email
            elif seller:
                seller_name = seller.email
        
        invoice_dict["seller_name"] = seller_name
            
        result.append(invoice_dict)
    
    return result


# BANK APPROVE / REJECT
@router.post("/{invoice_id}/decision")
def bank_decision(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    decision_data: dict = None
):
    import datetime
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles and "ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK or ADMIN can approve/reject")

    invoice = db.query(Invoice).get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404)

    # Get decision from body
    if not decision_data or "decision" not in decision_data:
        raise HTTPException(status_code=400, detail="Decision is required")
    
    decision = decision_data["decision"]
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")

    invoice.status = decision
    
    # If rejected, save rejection comment and metadata
    if decision == "REJECTED":
        invoice.rejection_comment = decision_data.get("comment", "Invoice rejected by admin")
        invoice.rejected_at = datetime.datetime.utcnow()
        invoice.rejected_by = int(user.get("sub"))
    else:
        # Clear rejection data if approved
        invoice.rejection_comment = None
        invoice.rejected_at = None
        invoice.rejected_by = None
    
    db.commit()
    return {"status": invoice.status, "message": f"Invoice {decision.lower()} successfully"}


# Dispute schemas
class DisputeCreate(BaseModel):
    reason_code: str
    description: str
    invoice_status: str  # Current status when disputed (for logging)

class DisputeResponse(BaseModel):
    message: str
    invoice_id: int
    new_status: str
    case_id: str
    dispute_type: str


# BUYER DISPUTE INVOICE
@router.post("/{invoice_id}/dispute", response_model=DisputeResponse)
def dispute_invoice(
    invoice_id: int,
    dispute_data: DisputeCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Allow buyer to dispute an invoice.
    
    Case A: Dispute when APPROVED (before financing) - blocks financing
    Case B: Dispute when FINANCED (after financing) - initiates case management
    """
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    # Only buyers can dispute
    if "BUYER" not in roles:
        raise HTTPException(status_code=403, detail="Only buyers can dispute invoices")
    
    # Get invoice
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if buyer owns this invoice
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="You can only dispute your own invoices")
    
    # Check if status allows dispute
    if invoice.status not in ['APPROVED', 'FINANCED']:
        raise HTTPException(
            status_code=400, 
            detail=f"Can only dispute invoices with status APPROVED or FINANCED. Current status: {invoice.status}"
        )
    
    # Validate description length
    if not dispute_data.description or len(dispute_data.description.strip()) < 20:
        raise HTTPException(status_code=400, detail="Description must be at least 20 characters")
    
    # Validate reason code
    valid_reasons = [
        'QUALITY_ISSUE', 'QUANTITY_MISMATCH', 'LATE_DELIVERY', 
        'WRONG_ITEMS', 'DAMAGED_GOODS', 'INVOICE_ERROR', 
        'CONTRACT_VIOLATION', 'OTHER'
    ]
    if dispute_data.reason_code not in valid_reasons:
        raise HTTPException(status_code=400, detail=f"Invalid reason code. Must be one of: {', '.join(valid_reasons)}")
    
    # Determine dispute type based on status
    original_status = invoice.status
    dispute_type = "PRE_FINANCE" if original_status == "APPROVED" else "POST_FINANCE"
    
    # Generate case ID
    case_id = f"DISP-{invoice_id}-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Update invoice status to DISPUTED
    invoice.status = "DISPUTED"
    invoice.dispute_reason = dispute_data.reason_code
    invoice.dispute_description = dispute_data.description
    invoice.dispute_type = dispute_type
    invoice.dispute_case_id = case_id
    invoice.disputed_at = datetime.datetime.utcnow()
    invoice.disputed_by = user_id
    
    # Log the dispute
    from app.models.audit import AuditLog
    audit_log = AuditLog(
        target_type='INVOICE',
        target_id=str(invoice_id),
        action='DISPUTE',
        actor_sub=str(user_id),
        actor_roles=','.join(roles),
        comments=f"Dispute Type: {dispute_type} | Reason: {dispute_data.reason_code} | Original Status: {original_status}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(invoice)
    
    # TODO: Send notifications to supplier, bank, and admin
    # This would be implemented with email/SMS service
    
    return DisputeResponse(
        message=f"Dispute submitted successfully. Case ID: {case_id}",
        invoice_id=invoice_id,
        new_status="DISPUTED",
        case_id=case_id,
        dispute_type=dispute_type
    )


# UPLOAD DISPUTE EVIDENCE
@router.post("/{invoice_id}/dispute/evidence")
async def upload_dispute_evidence(
    invoice_id: int,
    files: list = None,  # Would use UploadFile from fastapi
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Upload evidence files for a dispute.
    Required for POST_FINANCE disputes.
    """
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    user_id = int(user["sub"])
    
    # Only buyers can upload evidence
    if "BUYER" not in roles:
        raise HTTPException(status_code=403, detail="Only buyers can upload dispute evidence")
    
    # Get invoice
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check ownership
    if invoice.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if invoice is disputed
    if invoice.status != "DISPUTED":
        raise HTTPException(status_code=400, detail="Can only upload evidence for disputed invoices")
    
    # TODO: Implement file upload to S3/storage
    # For now, just acknowledge receipt
    
    return {
        "message": "Evidence files received",
        "invoice_id": invoice_id,
        "case_id": invoice.dispute_case_id,
        "files_count": len(files) if files else 0
    }
