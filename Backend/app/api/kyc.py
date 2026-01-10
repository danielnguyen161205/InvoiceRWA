from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.organization import Organization, OrgStatus, OrgType
from app.models.document import Document
from app.models.registry import RegistryEntry
from app.models.ubo import UBO
from app.schemas.kyc import OrganizationCreate, OrganizationOut, DocumentCreate, DocumentOut, UBOCreate, ReviewAction
from app.db.base import Base
from typing import List
import uuid
from app.storage import save_file
from app.core.security import get_current_user
from app.storage import generate_presigned_url
from app.models.audit import AuditLog, OrganizationReview
from datetime import datetime, timezone


def audit_log(db: Session, actor_sub: str, actor_roles: str, action: str, target_type: str, target_id: str = None, comments: str = None):
    entry = AuditLog(actor_sub=actor_sub, actor_roles=actor_roles, action=action, target_type=target_type, target_id=str(target_id) if target_id else None, comments=comments)
    db.add(entry)
    db.commit()

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.post("/organizations", response_model=OrganizationOut)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    # Check if user already has an organization
    from app.models.user import User
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if db_user and db_user.organization_id:
        # User already has an organization, update it instead
        existing_org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
        if existing_org:
            # Update existing organization with new data
            existing_org.org_type = payload.org_type
            existing_org.legal_name = payload.legal_name
            existing_org.trade_name = payload.trade_name
            existing_org.foreign_name = payload.foreign_name
            existing_org.tax_id = payload.tax_id
            existing_org.registration_number = payload.registration_number
            existing_org.legal_form = payload.legal_form
            existing_org.operation_status = payload.operation_status
            existing_org.establishment_date = payload.establishment_date
            existing_org.legal_representative = payload.legal_representative
            existing_org.address = payload.address
            existing_org.tax_verification_status = payload.tax_verification_status
            existing_org.bank_account_info = payload.bank_account_info
            existing_org.authorized_persons_list = payload.authorized_persons_list
            existing_org.status = OrgStatus.PENDING  # Reset to pending for review
            existing_org.rejection_reason = None  # Clear rejection reason when resubmitting
            
            db.commit()
            db.refresh(existing_org)
            return existing_org
    
    # Create new organization with all KYB fields
    org = Organization(
        uid=str(uuid.uuid4()),
        org_type=payload.org_type,
        legal_name=payload.legal_name,
        trade_name=payload.trade_name,
        foreign_name=payload.foreign_name,
        tax_id=payload.tax_id,
        registration_number=payload.registration_number,
        legal_form=payload.legal_form,
        operation_status=payload.operation_status,
        establishment_date=payload.establishment_date,
        legal_representative=payload.legal_representative,
        address=payload.address,
        tax_verification_status=payload.tax_verification_status,
        bank_account_info=payload.bank_account_info,
        authorized_persons_list=payload.authorized_persons_list,
        status=OrgStatus.PENDING,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    
    # Link organization to user
    if db_user:
        db_user.organization_id = org.id
        db.add(db_user)
        db.commit()
    
    # audit
    try:
        audit_log(db, user.get('sub'), ','.join(user.get('roles', [])) if user.get('roles') else None, 'CREATE_ORGANIZATION', 'organization', str(org.id), None)
    except Exception:
        pass
    return org


@router.get("/organizations/all")
def get_all_organizations(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get all organizations with user info - ADMIN only"""
    from app.models.user import User
    roles = user.get('roles', [])
    if 'ADMIN' not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orgs = db.query(Organization).all()
    result = []
    
    for org in orgs:
        # Find user linked to this organization
        user_obj = db.query(User).filter(User.organization_id == org.id).first()
        
        org_dict = {
            "id": org.id,
            "legal_name": org.legal_name,
            "trade_name": org.trade_name,
            "tax_id": org.tax_id,
            "address": org.address,
            "status": org.status,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "user_email": user_obj.email if user_obj else None,
            "user_roles": user_obj.roles if user_obj else None
        }
        result.append(org_dict)
    
    return result


@router.get("/organizations/me", response_model=OrganizationOut)
@router.get("/organization", response_model=OrganizationOut)  # Alias for compatibility
def get_my_organization(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get the organization linked to the current user"""
    from app.models.user import User
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=404, detail="No organization found for this user")
    
    org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put("/organizations/me/wallet")
def update_organization_wallet(
    wallet_data: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Update wallet address for user's organization"""
    from app.models.user import User
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=404, detail="No organization found for this user")
    
    org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    wallet_address = wallet_data.get('wallet_address', '').strip()
    
    # Basic validation for Ethereum address
    if wallet_address and not wallet_address.startswith('0x'):
        raise HTTPException(status_code=400, detail="Invalid wallet address format")
    if wallet_address and len(wallet_address) != 42:
        raise HTTPException(status_code=400, detail="Invalid wallet address length")
    
    org.wallet_address = wallet_address
    db.commit()
    db.refresh(org)
    
    # Audit log
    audit_log(db, user.get('sub'), ','.join(user.get('roles', [])), 
             'UPDATE_WALLET', 'ORGANIZATION', org.id, 
             f"Wallet address updated to {wallet_address}")
    
    return {"message": "Wallet address updated successfully", "wallet_address": wallet_address}


@router.delete("/organizations/me/wallet")
def remove_organization_wallet(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Remove wallet address from user's organization"""
    from app.models.user import User
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=404, detail="No organization found for this user")
    
    org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org.wallet_address = None
    db.commit()
    
    # Audit log
    audit_log(db, user.get('sub'), ','.join(user.get('roles', [])), 
             'REMOVE_WALLET', 'ORGANIZATION', org.id, 
             "Wallet address removed")
    
    return {"message": "Wallet address removed successfully"}


# Alternative endpoint path for consistency
@router.delete("/organization/wallet")
def remove_org_wallet_alt(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Remove wallet address from user's organization (alternative path)"""
    return remove_organization_wallet(db, user)


@router.get("/organizations/buyers", response_model=List[OrganizationOut])
def get_approved_buyers(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get list of KYC-verified organizations (SME/BUYER roles) that can be selected as buyers"""
    from app.models.user import User
    
    # Get approved organizations with SME or BUYER type
    orgs = db.query(Organization).filter(
        Organization.status == OrgStatus.APPROVED,
        Organization.org_type.in_([OrgType.SME, OrgType.BUYER])
    ).all()
    
    # Filter to only include orgs that have at least one verified user with SME or BUYER role
    verified_orgs = []
    for org in orgs:
        # Check if organization has any user with SME or BUYER role
        users = db.query(User).filter(User.organization_id == org.id).all()
        for u in users:
            # Check if user has SME or BUYER in their roles
            user_roles = u.roles.split(',') if u.roles else []
            if 'SME' in user_roles or 'BUYER' in user_roles:
                verified_orgs.append(org)
                break  # One verified user is enough
    
    return verified_orgs


@router.get("/organizations/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get("/organizations/{org_id}/comprehensive")
def get_organization_comprehensive(org_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get comprehensive organization data with KYB, KYC, UBO, shareholders, and documents - ADMIN only"""
    from app.models.user import User
    import json
    
    # Check admin access
    roles = user.get('roles', [])
    if 'ADMIN' not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get organization
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get user linked to organization
    user_obj = db.query(User).filter(User.organization_id == org_id).first()
    
    # Get KYC persons
    kyc_persons = db.query(KycPerson).filter(KycPerson.org_id == org_id).all()
    
    # Get shareholders
    shareholders = db.query(Shareholder).filter(Shareholder.org_id == org_id).all()
    
    # Get UBO
    ubo = db.query(UBO).filter(UBO.org_id == org_id).first()
    
    # Get documents
    documents = db.query(Document).filter(Document.org_id == org_id).all()
    
    # Generate presigned URLs for documents
    docs_with_urls = []
    for doc in documents:
        doc_data = {
            "id": doc.id,
            "doc_type": doc.doc_type,
            "filename": doc.filename,
            "file_hash": doc.file_hash,
            "storage_path": doc.storage_path,
            "uploaded_by": doc.uploaded_by,
            "upload_time": doc.upload_time.isoformat() if doc.upload_time else None,
            "review_status": doc.review_status,
            "download_url": None
        }
        
        # Generate presigned URL if storage_path exists
        if doc.storage_path:
            try:
                doc_data["download_url"] = generate_presigned_url(doc.storage_path)
            except Exception as e:
                print(f"Error generating presigned URL: {e}")
        
        docs_with_urls.append(doc_data)
    
    # Parse UBO ownership documents
    ubo_documents = []
    if ubo and ubo.ownership_documents:
        try:
            ubo_docs = json.loads(ubo.ownership_documents)
            for ubo_doc in ubo_docs:
                if isinstance(ubo_doc, dict) and 'path' in ubo_doc:
                    try:
                        ubo_doc['download_url'] = generate_presigned_url(ubo_doc['path'])
                    except:
                        ubo_doc['download_url'] = None
                    ubo_documents.append(ubo_doc)
        except:
            pass
    
    # Build comprehensive response
    return {
        "organization": {
            "id": org.id,
            "uid": org.uid,
            "org_type": org.org_type,
            "legal_name": org.legal_name,
            "trade_name": org.trade_name,
            "foreign_name": org.foreign_name,
            "tax_id": org.tax_id,
            "registration_number": org.registration_number,
            "legal_form": org.legal_form,
            "operation_status": org.operation_status,
            "establishment_date": org.establishment_date.isoformat() if org.establishment_date else None,
            "legal_representative": org.legal_representative,
            "address": org.address,
            "tax_verification_status": org.tax_verification_status,
            "bank_account_info": org.bank_account_info,
            "authorized_persons_list": org.authorized_persons_list,
            "wallet_address": org.wallet_address,
            "status": org.status,
            "risk_level": org.risk_level,
            "verified_at": org.verified_at.isoformat() if org.verified_at else None,
            "verified_by": org.verified_by,
            "rejection_reason": org.rejection_reason,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "updated_at": org.updated_at.isoformat() if org.updated_at else None,
        },
        "user": {
            "email": user_obj.email if user_obj else None,
            "roles": user_obj.roles if user_obj else None,
        } if user_obj else None,
        "kyc_persons": [
            {
                "id": p.id,
                "full_name": p.full_name,
                "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
                "nationality": p.nationality,
                "id_type": p.id_type,
                "id_number": p.id_number,
                "id_issue_date": p.id_issue_date.isoformat() if p.id_issue_date else None,
                "id_issue_place": p.id_issue_place,
                "address": p.address,
                "contact": p.contact,
                "role": p.role,
                "id_document_path": p.id_document_path,
            }
            for p in kyc_persons
        ],
        "shareholders": [
            {
                "id": s.id,
                "name": s.name,
                "shareholder_type": s.shareholder_type,
                "ownership_percent": s.ownership_percent,
                "id_number": s.id_number,
                "address": s.address,
                "contact": s.contact,
            }
            for s in shareholders
        ],
        "ubo": {
            "id": ubo.id,
            "is_listed": ubo.is_listed,
            "stock_exchange": ubo.stock_exchange,
            "stock_code": ubo.stock_code,
            "notes": ubo.notes,
            "ownership_documents": ubo_documents,
        } if ubo else None,
        "documents": docs_with_urls,
    }


@router.post("/organizations/{org_id}/documents", response_model=DocumentOut)
def upload_document(org_id: int, payload: DocumentCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # register document
    doc = Document(org_id=org_id, doc_type=payload.doc_type, filename=payload.filename or "", file_hash=payload.file_hash, uploaded_by=payload.uploaded_by)
    db.add(doc)

    # add to registry for duplicate detection
    existing = db.query(RegistryEntry).filter(RegistryEntry.doc_hash == payload.file_hash).first()
    if existing:
        # mark lien flag if collision
        existing.lien_flag = True
        db.add(existing)
    else:
        entry = RegistryEntry(org_id=org_id, doc_hash=payload.file_hash, lien_flag=False)
        db.add(entry)

    db.commit()
    db.refresh(doc)
    return doc


@router.post("/organizations/{org_id}/upload", response_model=DocumentOut)
def upload_file_and_register(org_id: int, file: UploadFile = File(...), uploaded_by: str = "", db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # save file via storage helper (S3 or local)
    file_hash, storage_path = save_file(org_id, file.filename, file.file, file.content_type or "application/octet-stream")

    # create Document record and Registry entry
    doc = Document(org_id=org_id, doc_type=file.content_type or "unknown", filename=file.filename, file_hash=file_hash, uploaded_by=uploaded_by)
    db.add(doc)

    existing = db.query(RegistryEntry).filter(RegistryEntry.doc_hash == file_hash).first()
    if existing:
        existing.lien_flag = True
        db.add(existing)
    else:
        entry = RegistryEntry(org_id=org_id, doc_hash=file_hash, lien_flag=False)
        db.add(entry)

    db.commit()
    db.refresh(doc)
    try:
        audit_log(db, user.get('sub'), ','.join(user.get('roles', [])) if user.get('roles') else None, 'UPLOAD_DOCUMENT', 'document', str(doc.id), f"filename={doc.filename}")
    except Exception:
        pass
    return doc


@router.get("/registry/check")
def check_registry(hash: str, db: Session = Depends(get_db)):
    entry = db.query(RegistryEntry).filter(RegistryEntry.doc_hash == hash).first()
    return {"exists": bool(entry), "lien_flag": entry.lien_flag if entry else False}


@router.post("/organizations/{org_id}/ubos")
def add_ubo(org_id: int, payload: UBOCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    u = UBO(org_id=org_id, name=payload.name, identifier=payload.identifier, ownership_pct=payload.ownership_pct)
    db.add(u)
    db.commit()
    return {"status": "ok"}


@router.post("/organizations/{org_id}/submit")
def submit_for_review(org_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org.status = OrgStatus.UNDER_REVIEW
    db.add(org)
    db.commit()
    try:
        audit_log(db, user.get('sub'), ','.join(user.get('roles', [])) if user.get('roles') else None, 'SUBMIT_FOR_REVIEW', 'organization', str(org.id), None)
    except Exception:
        pass
    return {"status": "submitted"}


@router.post("/organizations/{org_id}/resubmit")
def resubmit_for_review(org_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Allow user to resubmit KYB/KYC after rejection"""
    from app.models.user import User
    
    # Verify user owns this organization
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or db_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="You don't have permission to resubmit this organization")
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Only allow resubmission if status is REJECTED
    if org.status != OrgStatus.REJECTED:
        raise HTTPException(status_code=400, detail="Only rejected organizations can be resubmitted")
    
    # Reset status to PENDING and clear rejection reason
    org.status = OrgStatus.PENDING
    org.rejection_reason = None
    db.add(org)
    db.commit()
    
    try:
        audit_log(db, user.get('sub'), ','.join(user.get('roles', [])) if user.get('roles') else None, 'RESUBMIT_AFTER_REJECTION', 'organization', str(org.id), 'User resubmitted after rejection')
    except Exception:
        pass
    
    return {"status": "pending", "message": "Organization reset to PENDING status. Please update your information and submit for review."}


@router.post("/organizations/{org_id}/review")
def review_org(org_id: int, action: ReviewAction, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    reviewer_sub = user.get('sub')
    reviewer_roles = ','.join(user.get('roles', [])) if user.get('roles') else None

    # Only allow review if status is PENDING
    if org.status != OrgStatus.PENDING:
        return {"status": org.status, "message": "Organization already reviewed"}

    # Create review record
    rev = OrganizationReview(org_id=org_id, reviewer_sub=reviewer_sub, action=action.action, comments=action.comments)
    db.add(rev)

    # Update status directly based on action
    if action.action == "APPROVE":
        org.status = OrgStatus.APPROVED
        org.rejection_reason = None  # Clear any previous rejection reason
        # Set verified_at timestamp when approved
        import datetime
        org.verified_at = datetime.now(timezone.utc)
        org.verified_by = int(reviewer_sub)  # Store who approved it
    else:
        org.status = OrgStatus.REJECTED
        # Save rejection comments so user can see why they were rejected
        org.rejection_reason = action.comments if action.comments else "Your application was rejected. Please review and resubmit."

    db.add(org)
    db.commit()
    
    try:
        audit_log(db, reviewer_sub, reviewer_roles, f'REVIEW_{action.action}', 'organization', str(org.id), action.comments)
    except Exception:
        pass
    
    return {"status": org.status}


@router.get('/documents/{doc_id}/download')
def get_document_download(doc_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')

    if not getattr(doc, 'storage_path', None):
        raise HTTPException(status_code=404, detail='Document not stored')

    try:
        url = generate_presigned_url(doc.storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"url": url}


# ========== KYC/UBO Endpoints ==========

from app.models.kyc_person import KycPerson
from app.models.ubo import Shareholder, UBO
from app.schemas.kyc_ubo import (
    KycPersonCreate, KycPersonOut,
    ShareholderCreate, ShareholderOut,
    UBOCreate, UBOOut,
    KycUboDataCreate, KycUboDataOut
)


@router.post("/kyc-ubo", response_model=KycUboDataOut)
def save_kyc_ubo_data(
    payload: KycUboDataCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Save all KYC/UBO data - auto-creates organization if needed"""
    from app.models.user import User
    
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Auto-create organization if user doesn't have one
    if not db_user.organization_id:
        # Determine org type from user roles
        user_roles = user.get('roles', [])
        org_type = None
        if 'SME' in user_roles:
            org_type = OrgType.SME
        elif 'BUYER' in user_roles:
            org_type = OrgType.BUYER
        elif 'BANK' in user_roles:
            org_type = OrgType.BANK
        
        # Create minimal organization - will be updated when KYB data submitted
        org = Organization(
            uid=str(uuid.uuid4()),
            org_type=org_type,
            legal_name="Pending KYB",
            status=OrgStatus.PENDING
        )
        db.add(org)
        db.flush()
        
        # Link to user
        db_user.organization_id = org.id
        db.add(db_user)
        db.commit()
        db.refresh(org)
        
        org_id = org.id
    else:
        org_id = db_user.organization_id
    
    # Delete existing data for this org (replace with new data)
    db.query(KycPerson).filter(KycPerson.org_id == org_id).delete()
    db.query(Shareholder).filter(Shareholder.org_id == org_id).delete()
    db.query(UBO).filter(UBO.org_id == org_id).delete()
    db.commit()
    
    # Create KYC Persons
    created_persons = []
    for person_data in payload.kyc_persons:
        person = KycPerson(
            org_id=org_id,
            full_name=person_data.full_name,
            date_of_birth=person_data.date_of_birth,
            nationality=person_data.nationality,
            id_type=person_data.id_type,
            id_number=person_data.id_number,
            id_issue_date=person_data.id_issue_date,
            id_issue_place=person_data.id_issue_place,
            address=person_data.address,
            contact=person_data.contact,
            role=person_data.role
        )
        db.add(person)
        db.flush()
        created_persons.append(person)
    
    # Create Shareholders
    created_shareholders = []
    for shareholder_data in payload.shareholders:
        shareholder = Shareholder(
            org_id=org_id,
            name=shareholder_data.name,
            shareholder_type=shareholder_data.shareholder_type,
            ownership_percent=shareholder_data.ownership_percent,
            id_number=shareholder_data.id_number,
            address=shareholder_data.address,
            contact=shareholder_data.contact
        )
        db.add(shareholder)
        db.flush()
        created_shareholders.append(shareholder)
    
    # Create or Update UBO
    created_ubo = None
    if payload.ubo:
        ubo = UBO(
            org_id=org_id,
            is_listed=payload.ubo.is_listed,
            stock_exchange=payload.ubo.stock_exchange,
            stock_code=payload.ubo.stock_code,
            notes=payload.ubo.notes
        )
        db.add(ubo)
        db.flush()
        created_ubo = ubo
    
    db.commit()
    
    # Refresh all objects
    for person in created_persons:
        db.refresh(person)
    for shareholder in created_shareholders:
        db.refresh(shareholder)
    if created_ubo:
        db.refresh(created_ubo)
    
    # Audit log
    try:
        audit_log(
            db, 
            user.get('sub'), 
            ','.join(user.get('roles', [])) if user.get('roles') else None,
            'SAVE_KYC_UBO',
            'organization',
            str(org_id),
            f"Saved {len(created_persons)} persons, {len(created_shareholders)} shareholders"
        )
    except Exception:
        pass
    
    return KycUboDataOut(
        kyc_persons=created_persons,
        shareholders=created_shareholders,
        ubo=created_ubo
    )


@router.get("/kyc-ubo", response_model=KycUboDataOut)
def get_kyc_ubo_data(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get all KYC/UBO data for user's organization"""
    from app.models.user import User
    
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=400, detail="User must have an organization first")
    
    org_id = db_user.organization_id
    
    # Get all data
    kyc_persons = db.query(KycPerson).filter(KycPerson.org_id == org_id).all()
    shareholders = db.query(Shareholder).filter(Shareholder.org_id == org_id).all()
    ubo = db.query(UBO).filter(UBO.org_id == org_id).first()
    
    return KycUboDataOut(
        kyc_persons=kyc_persons,
        shareholders=shareholders,
        ubo=ubo
    )


@router.post("/kyc-ubo/upload-documents")
async def upload_ubo_documents(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Upload UBO ownership documents"""
    from app.models.user import User
    import json
    
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=400, detail="User must have an organization first")
    
    org_id = db_user.organization_id
    
    # Get or create UBO record
    ubo = db.query(UBO).filter(UBO.org_id == org_id).first()
    if not ubo:
        ubo = UBO(org_id=org_id, is_listed=False)
        db.add(ubo)
        db.commit()
        db.refresh(ubo)
    
    # Upload files and collect paths
    file_paths = []
    for file in files:
        try:
            path = await save_file(file, f"ubo/{org_id}")
            file_paths.append({
                "filename": file.filename,
                "path": path,
                "size": file.size
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}: {str(e)}")
    
    # Update UBO with document paths
    existing_docs = []
    if ubo.ownership_documents:
        try:
            existing_docs = json.loads(ubo.ownership_documents)
        except:
            existing_docs = []
    
    existing_docs.extend(file_paths)
    ubo.ownership_documents = json.dumps(existing_docs, ensure_ascii=False)
    
    db.commit()
    db.refresh(ubo)
    
    return {
        "message": f"Uploaded {len(files)} documents successfully",
        "files": file_paths
    }


@router.post("/organization/wallet")
def save_wallet_address(
    wallet_data: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Save blockchain wallet address to organization
    """
    from app.models.user import User
    
    user_id = int(user.get('sub'))
    db_user = db.query(User).filter(User.id == user_id).first()
    
    if not db_user or not db_user.organization_id:
        raise HTTPException(status_code=400, detail="User does not have an organization")
    
    org = db.query(Organization).filter(Organization.id == db_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    wallet_address = wallet_data.get('wallet_address', '').strip()
    
    # Basic validation
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    if not wallet_address.startswith('0x') or len(wallet_address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum wallet address format")
    
    # Check if wallet already used by another organization
    existing = db.query(Organization).filter(
        Organization.wallet_address == wallet_address,
        Organization.id != org.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="This wallet address is already registered to another organization"
        )
    
    # Save wallet address
    org.wallet_address = wallet_address
    db.commit()
    db.refresh(org)
    
    audit_log(
        db=db,
        actor_sub=str(user_id),
        actor_roles=','.join(user.get('roles', [])),
        action="UPDATE_WALLET",
        target_type="organization",
        target_id=str(org.id),
        comments=f"Set wallet address: {wallet_address}"
    )
    
    return {
        "success": True,
        "message": "Wallet address saved successfully",
        "wallet_address": wallet_address,
        "organization_id": org.id
    }


@router.get("/admin/wallets-check")
def admin_check_duplicate_wallets(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Admin endpoint to check for duplicate wallet addresses
    """
    # Check if user is ADMIN
    roles = user.get("roles") or ([user.get("role")] if user.get("role") else [])
    if "ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all organizations with wallet addresses
    orgs = db.query(Organization).filter(Organization.wallet_address.isnot(None)).all()
    
    # Track wallet addresses and find duplicates
    wallet_map = {}
    duplicates = []
    all_wallets = []
    
    for org in orgs:
        wallet = org.wallet_address.lower() if org.wallet_address else None
        if wallet:
            org_info = {
                "id": org.id,
                "legal_name": org.legal_name,
                "trade_name": org.trade_name,
                "wallet_address": org.wallet_address,
                "status": org.status
            }
            all_wallets.append(org_info)
            
            if wallet in wallet_map:
                # Found duplicate
                duplicates.append({
                    "wallet_address": wallet,
                    "organizations": [wallet_map[wallet], org_info]
                })
            else:
                wallet_map[wallet] = org_info
    
    return {
        "total_organizations_with_wallets": len(orgs),
        "unique_wallets": len(wallet_map),
        "duplicate_count": len(duplicates),
        "duplicates": duplicates,
        "all_wallets": all_wallets
    }
