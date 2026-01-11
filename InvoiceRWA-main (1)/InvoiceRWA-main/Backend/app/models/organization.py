from sqlalchemy import Column, Integer, String, DateTime, Enum, Date, Text
from app.db.base import Base
import datetime
from enum import Enum as PyEnum


class OrgStatus(str, PyEnum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class OrgType(str, PyEnum):
    SME = "SME"              # SME/Supplier
    BUYER = "BUYER"          # Buyer/Customer
    BANK = "BANK"            # Bank/Financial Institution


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(100), unique=True, index=True, nullable=True)
    
    # Organization Type
    org_type = Column(Enum(OrgType), nullable=True)  # SME, BUYER, or BANK
    
    # Basic Information (KYC/KYB Common)
    legal_name = Column(String(255), nullable=False)  # Tên doanh nghiệp
    trade_name = Column(String(255), nullable=True)   # Tên doanh nghiệp viết tắt
    foreign_name = Column(String(255), nullable=True)  # Tên tiếng nước ngoài
    tax_id = Column(String(50), nullable=True, index=True)  # Mã số doanh nghiệp/MST
    registration_number = Column(String(100), nullable=True)  # Mã số đăng ký kinh doanh
    legal_form = Column(String(100), nullable=True)  # Loại hình pháp lý
    operation_status = Column(String(50), nullable=True)  # Tình trạng hoạt động
    establishment_date = Column(Date, nullable=True)  # Ngày bắt đầu thành lập
    legal_representative = Column(String(255), nullable=True)  # Người đại diện pháp luật
    address = Column(String(500), nullable=True)  # Địa chỉ trụ sở chính
    
    # KYB Specific - Legal Documents
    tax_verification_status = Column(String(50), nullable=True)  # Trạng thái MST từ tracuunnt
    appointment_decision_doc = Column(String(500), nullable=True)  # Link/path quyết định bổ nhiệm
    shareholder_list_doc = Column(String(500), nullable=True)  # Danh sách cổ đông/thành viên
    bank_account_info = Column(Text, nullable=True)  # Thông tin TK ngân hàng (JSON string)
    
    # KYB Specific - Project Authorization
    board_resolution_doc = Column(String(500), nullable=True)  # Nghị quyết HĐQT/HĐTV
    authorized_persons_list = Column(Text, nullable=True)  # Danh sách người được ủy quyền (JSON)
    signature_specimen_doc = Column(String(500), nullable=True)  # Mẫu chữ ký/ký số
    
    # Blockchain Integration
    wallet_address = Column(String(128), nullable=True, index=True)  # Ethereum wallet address (0x...)
    
    # Verification & Status
    status = Column(Enum(OrgStatus), default=OrgStatus.PENDING)
    risk_level = Column(String(50), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, nullable=True)  # Admin user who verified
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
