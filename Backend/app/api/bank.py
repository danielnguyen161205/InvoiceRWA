from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.invoice import Invoice
from app.models.bank_request import BankRequest
from app.models.user import User
from app.models.organization import Organization
from app.schemas.bank_request import BankRequestCreate, BankRequestOut, BankResponseRequest
from app.core.security import get_current_user
from app.services.notification_service import NotificationService, NotificationTemplates
from typing import List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bank", tags=["Bank"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SME: Send financing request to banks
@router.post("/requests", response_model=List[BankRequestOut])
def send_bank_requests(
    data: BankRequestCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """SME sends financing request to one or more banks for an invoice"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "SME" not in roles:
        raise HTTPException(status_code=403, detail="Only SME can send bank requests")
    
    user_id = int(user["sub"])
    
    # Verify invoice exists and belongs to SME
    invoice = db.query(Invoice).filter(
        Invoice.id == data.invoice_id,
        Invoice.sme_id == user_id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found or not owned by you")
    
    # Check invoice is in APPROVED status
    if invoice.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Invoice must be APPROVED to send bank requests")
    
    # Verify banks exist
    banks = db.query(User).filter(
        User.id.in_(data.bank_ids),
        (User.roles.like('%BANK%')) | (User.role == 'BANK')
    ).all()
    
    if len(banks) != len(data.bank_ids):
        raise HTTPException(status_code=400, detail="Some bank IDs are invalid")
    
    # Create requests for each bank
    created_requests = []
    for bank_id in data.bank_ids:
        # Check if request already exists
        existing = db.query(BankRequest).filter(
            BankRequest.invoice_id == data.invoice_id,
            BankRequest.bank_id == bank_id,
            BankRequest.status.in_(["PENDING", "FINANCING"])
        ).first()
        
        if existing:
            continue  # Skip if already has active request
        
        request = BankRequest(
            invoice_id=data.invoice_id,
            bank_id=bank_id,
            sme_id=user_id,
            status="PENDING",
            requested_at=datetime.now(timezone.utc)
        )
        db.add(request)
        created_requests.append(request)
    
    db.commit()
    for req in created_requests:
        db.refresh(req)

    # Notify banks about the financing requests
    try:
        notification_service = NotificationService(db)

        for bank in banks:
            # Get bank organization name
            bank_org = db.query(Organization).filter(Organization.id == bank.organization_id).first()
            bank_name = bank_org.legal_name if bank_org else bank.email

            template = NotificationTemplates.bank_request_sent(
                invoice_number=invoice.invoice_number,
                bank_name=bank_name
            )

            # Find the request for this specific bank
            bank_request = next((req for req in created_requests if req.bank_id == bank.id), None)
            notification_service.create_notification(
                user_id=bank.id,
                notification_type=template["type"],
                title=template["title"],
                message=template["message"],
                priority=template["priority"],
                metadata={"invoice_id": invoice.id, "request_id": bank_request.id if bank_request else None},
                link=f"/bank/invoices/available"
            )

            logger.info(f"Financing request notification sent to bank {bank.id} for invoice {invoice.id}")
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")

    return created_requests


# BANK: View available invoices (only for viewing - no purchase)
@router.get("/invoices/available")
def get_available_invoices(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank views all approved invoices (basic info only - for viewing purposes)"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can view this")
    
    bank_id = int(user["sub"])
    
    # Get requests sent to this bank
    my_request_invoice_ids = db.query(BankRequest.invoice_id).filter(
        BankRequest.bank_id == bank_id
    ).all()
    my_request_invoice_ids = [r[0] for r in my_request_invoice_ids]
    
    # Get approved invoices that don't have request to this bank
    available_invoices = db.query(Invoice).filter(
        Invoice.status == "APPROVED",
        ~Invoice.id.in_(my_request_invoice_ids) if my_request_invoice_ids else True
    ).all()
    
    result = []
    for invoice in available_invoices:
        result.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": invoice.status,
            "buyer_name": invoice.buyer_name,
            "created_at": invoice.created_at,
        })
    
    return result


# BANK: View my portfolio (financed invoices + invoices with requests from SME)
@router.get("/invoices/portfolio")
def get_my_portfolio(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank views their portfolio: financed invoices + invoices that SME sent requests to this bank"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can view this")
    
    bank_id = int(user["sub"])
    
    # Get requests sent to this bank
    my_requests = db.query(BankRequest).filter(
        BankRequest.bank_id == bank_id
    ).all()
    
    request_map = {req.invoice_id: req for req in my_requests}
    request_invoice_ids = list(request_map.keys())
    
    # Get invoices that are:
    # 1. FINANCED status (any bank)
    # 2. Have requests to this bank (APPROVED/FINANCING status)
    portfolio_invoices = db.query(Invoice).filter(
        (Invoice.status == "FINANCED") | 
        (Invoice.id.in_(request_invoice_ids))
    ).all()
    
    result = []
    for invoice in portfolio_invoices:
        has_request = invoice.id in request_map
        
        # Determine status to show to bank
        # If there's a request in FINANCING status, show FINANCING to bank
        # Otherwise show the actual invoice status
        display_status = invoice.status
        if has_request and request_map[invoice.id].status == "FINANCING":
            display_status = "FINANCING"
        
        # Full information for portfolio invoices
        invoice_data = {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "status": display_status,  # Show FINANCING if request is in FINANCING
            "issue_date": invoice.issue_date,
            "buyer_name": invoice.buyer_name,
            "payment_term": invoice.payment_term,
            "proposed_ltv": invoice.proposed_ltv,
            "discount_rate": invoice.discount_rate,
            "funding_category": invoice.funding_category,
            "funding_purpose": invoice.funding_purpose,
            "created_at": invoice.created_at,
            "has_request": has_request,
        }
        
        if has_request:
            invoice_data["request_status"] = request_map[invoice.id].status
            invoice_data["request_id"] = request_map[invoice.id].id
            invoice_data["finance_amount"] = request_map[invoice.id].finance_amount
            invoice_data["interest_rate"] = request_map[invoice.id].interest_rate
        
        result.append(invoice_data)
    
    return result


# BANK: Accept and start financing
@router.post("/requests/{request_id}/accept")
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank accepts the request and starts financing (simplified version)"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can accept")
    
    bank_id = int(user["sub"])
    
    # Get request
    request = db.query(BankRequest).filter(
        BankRequest.id == request_id,
        BankRequest.bank_id == bank_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Request must be PENDING")
    
    # Update request
    request.status = "FINANCING"
    request.financing_started_at = datetime.now(timezone.utc)
    request.bank_responded_at = datetime.now(timezone.utc)
    
    # Do NOT change invoice status - it should remain APPROVED
    # Invoice status only changes to FINANCED when both bank and SME confirm
    # For now, just link the bank to track who is financing
    invoice = db.query(Invoice).filter(Invoice.id == request.invoice_id).first()
    if not invoice.bank_id:  # Only set if not already set
        invoice.bank_id = bank_id
    
    db.commit()
    db.refresh(request)
    
    return {"message": "Financing started", "request": request}


@router.post("/requests/{request_id}/finance")
def finance_invoice(
    request_id: int,
    data: BankResponseRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank accepts the request and starts financing"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can finance")
    
    bank_id = int(user["sub"])
    
    # Get request
    request = db.query(BankRequest).filter(
        BankRequest.id == request_id,
        BankRequest.bank_id == bank_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Request must be PENDING")
    
    # Update request
    request.status = "FINANCING"
    request.financing_started_at = datetime.now(timezone.utc)
    request.finance_amount = data.finance_amount
    request.interest_rate = data.interest_rate
    request.notes = data.notes
    request.bank_responded_at = datetime.now(timezone.utc)
    
    # Update invoice
    invoice = db.query(Invoice).filter(Invoice.id == request.invoice_id).first()
    invoice.status = "FINANCING"
    invoice.bank_id = bank_id

    db.commit()
    db.refresh(request)

    # Notify SME that bank accepted the financing request
    try:
        notification_service = NotificationService(db)
        bank_user = db.query(User).filter(User.id == bank_id).first()
        bank_org = db.query(Organization).filter(Organization.id == bank_user.organization_id).first()
        bank_name = bank_org.legal_name if bank_org else bank_user.email

        template = NotificationTemplates.bank_accepted(
            invoice_number=invoice.invoice_number,
            bank_name=bank_name
        )

        notification_service.create_notification(
            user_id=request.sme_id,
            notification_type=template["type"],
            title=template["title"],
            message=template["message"],
            priority=template["priority"],
            metadata={"invoice_id": invoice.id, "request_id": request.id, "amount": data.finance_amount},
            link=f"/invoices/{invoice.id}"
        )

        logger.info(f"Financing acceptance notification sent to SME {request.sme_id} for invoice {invoice.id}")
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")

    return {"message": "Financing started", "request": request}


# BANK: Mark as financed (bank transferred money)
@router.post("/requests/{request_id}/financed")
def mark_bank_financed(
    request_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank marks that they have transferred the money"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can mark as financed")
    
    bank_id = int(user["sub"])
    
    request = db.query(BankRequest).filter(
        BankRequest.id == request_id,
        BankRequest.bank_id == bank_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "FINANCING":
        raise HTTPException(status_code=400, detail="Request must be in FINANCING status")
    
    # Update request
    request.bank_financed_at = datetime.now(timezone.utc)
    
    # Update invoice
    invoice = db.query(Invoice).filter(Invoice.id == request.invoice_id).first()
    invoice.bank_confirmed_financed = True
    invoice.bank_financed_at = datetime.now(timezone.utc)
    
    # Check if SME also confirmed
    if invoice.sme_confirmed_receipt:
        # Both confirmed, finalize
        invoice.status = "FINANCED"
        request.status = "FINANCED"
        request.financed_at = datetime.now(timezone.utc)

    db.commit()

    # Notify SME that bank has transferred funds
    try:
        notification_service = NotificationService(db)
        bank_user = db.query(User).filter(User.id == bank_id).first()
        bank_org = db.query(Organization).filter(Organization.id == bank_user.organization_id).first()
        bank_name = bank_org.legal_name if bank_org else bank_user.email

        # Get finance amount from request
        finance_amount = request.finance_amount or invoice.amount * 0.8  # Default to 80%

        template = NotificationTemplates.bank_financed(
            invoice_number=invoice.invoice_number,
            bank_name=bank_name,
            amount=finance_amount
        )

        notification_service.create_notification(
            user_id=request.sme_id,
            notification_type=template["type"],
            title=template["title"],
            message=template["message"],
            priority=template["priority"],
            metadata={"invoice_id": invoice.id, "request_id": request.id, "amount": finance_amount},
            link=f"/invoices/{invoice.id}"
        )

        logger.info(f"Financing confirmation notification sent to SME {request.sme_id} for invoice {invoice.id}")
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")

    return {"message": "Bank confirmed financed", "status": request.status}


# BANK: Reject request
@router.post("/requests/{request_id}/reject")
def reject_request(
    request_id: int,
    rejection_reason: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Bank rejects the financing request"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "BANK" not in roles:
        raise HTTPException(status_code=403, detail="Only BANK can reject")
    
    bank_id = int(user["sub"])
    
    request = db.query(BankRequest).filter(
        BankRequest.id == request_id,
        BankRequest.bank_id == bank_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status not in ["PENDING"]:
        raise HTTPException(status_code=400, detail="Can only reject PENDING requests")
    
    # Update request
    request.status = "REJECTED"
    request.rejection_reason = rejection_reason
    request.bank_responded_at = datetime.now(timezone.utc)

    db.commit()

    # Notify SME about rejection
    try:
        notification_service = NotificationService(db)
        bank_user = db.query(User).filter(User.id == bank_id).first()
        bank_org = db.query(Organization).filter(Organization.id == bank_user.organization_id).first()
        bank_name = bank_org.legal_name if bank_org else bank_user.email

        # Get invoice details
        invoice = db.query(Invoice).filter(Invoice.id == request.invoice_id).first()

        template = NotificationTemplates.bank_rejected(
            invoice_number=invoice.invoice_number,
            bank_name=bank_name,
            reason=rejection_reason
        )

        notification_service.create_notification(
            user_id=request.sme_id,
            notification_type=template["type"],
            title=template["title"],
            message=template["message"],
            priority=template["priority"],
            metadata={"invoice_id": invoice.id, "request_id": request.id, "reason": rejection_reason},
            link=f"/invoices/{invoice.id}"
        )

        logger.info(f"Rejection notification sent to SME {request.sme_id} for request {request.id}")
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")

    return {"message": "Request rejected", "request": request}


# SME: Confirm receipt of money
@router.post("/invoices/{invoice_id}/confirm-receipt")
def confirm_receipt(
    invoice_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """SME confirms they received the money from bank"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "SME" not in roles:
        raise HTTPException(status_code=403, detail="Only SME can confirm receipt")
    
    user_id = int(user["sub"])
    
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.sme_id == user_id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if there's an active FINANCING request
    request = db.query(BankRequest).filter(
        BankRequest.invoice_id == invoice_id,
        BankRequest.status == "FINANCING"
    ).first()
    
    if not request:
        raise HTTPException(status_code=400, detail="No active financing request found")
    
    # Update invoice
    invoice.sme_confirmed_receipt = True
    invoice.sme_confirmed_at = datetime.now(timezone.utc)
    
    if request:
        request.sme_confirmed_receipt_at = datetime.now(timezone.utc)
        
        # Check if bank also confirmed
        if invoice.bank_confirmed_financed:
            # Both confirmed, finalize
            invoice.status = "FINANCED"
            request.status = "FINANCED"
            request.financed_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Receipt confirmed", "status": invoice.status}


# SME: View my bank requests
@router.get("/my-requests", response_model=List[BankRequestOut])
def get_my_requests(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """SME views all their bank requests"""
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "SME" not in roles:
        raise HTTPException(status_code=403, detail="Only SME can view their requests")
    
    user_id = int(user["sub"])
    
    requests = db.query(BankRequest).filter(
        BankRequest.sme_id == user_id
    ).all()
    
    return requests
