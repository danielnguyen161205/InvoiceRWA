from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date
from enum import Enum


class OrgStatus(str, Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class OrgType(str, Enum):
    SME = "SME"
    BUYER = "BUYER"
    BANK = "BANK"


class OrganizationCreate(BaseModel):
    # Organization Type
    org_type: Optional[OrgType] = None
    
    # Basic Information (KYC/KYB Common)
    legal_name: str  # Tên doanh nghiệp
    trade_name: Optional[str] = None  # Tên viết tắt
    foreign_name: Optional[str] = None  # Tên tiếng nước ngoài
    tax_id: Optional[str] = None  # MST
    registration_number: Optional[str] = None  # Mã số đăng ký
    legal_form: Optional[str] = None  # Loại hình pháp lý
    operation_status: Optional[str] = None  # Tình trạng hoạt động
    establishment_date: Optional[date] = None  # Ngày thành lập
    legal_representative: Optional[str] = None  # Người đại diện pháp luật
    address: Optional[str] = None  # Địa chỉ trụ sở
    
    # KYB Specific Fields (optional for SME/BUYER)
    tax_verification_status: Optional[str] = None
    bank_account_info: Optional[str] = None  # JSON string
    authorized_persons_list: Optional[str] = None  # JSON string


class OrganizationOut(BaseModel):
    id: int
    org_type: Optional[OrgType]
    legal_name: str
    trade_name: Optional[str]
    foreign_name: Optional[str]
    tax_id: Optional[str]
    registration_number: Optional[str]
    legal_form: Optional[str]
    operation_status: Optional[str]
    establishment_date: Optional[date]
    legal_representative: Optional[str]
    address: Optional[str]
    tax_verification_status: Optional[str]
    bank_account_info: Optional[str]
    authorized_persons_list: Optional[str]
    wallet_address: Optional[str]
    status: OrgStatus

    model_config = ConfigDict(from_attributes=True)


class OrganizationWithUserOut(BaseModel):
    id: int
    legal_name: str
    trade_name: Optional[str]
    tax_id: Optional[str]
    address: Optional[str]
    status: OrgStatus
    user_email: Optional[str] = None
    user_roles: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentCreate(BaseModel):
    doc_type: str
    filename: Optional[str] = None
    file_hash: str
    uploaded_by: Optional[str] = None


class DocumentOut(BaseModel):
    id: int
    org_id: int
    doc_type: str
    filename: Optional[str]
    file_hash: str
    storage_path: Optional[str]
    upload_time: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class UBOCreate(BaseModel):
    name: str
    identifier: Optional[str] = None
    ownership_pct: Optional[float] = None


class ReviewAction(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    comments: Optional[str] = None
